const grid = 10;
const DrawingStates = Object.freeze({ 'none': 1, 'ready': 2, 'started': 3 });
const ChannelTypes = Object.freeze({ 'normal': 'normal', 'cloggable': 'cloggable', 'bypass': 'bypass' });

const lineColor = { };
lineColor[ChannelTypes.normal]= '#9c9c9c';
lineColor[ChannelTypes.cloggable]= '#70719c';
lineColor[ChannelTypes.bypass]= '#9c5872';

const lineColorSelected = { };
lineColorSelected[ChannelTypes.normal] = '#689c52';
lineColorSelected[ChannelTypes.cloggable] = '#3e299c';
lineColorSelected[ChannelTypes.bypass] = '#9c3540';


(function() {
    const canvas = new fabric.Canvas('c', { selection: false });

    let canvasContainer = $('.workspace');
    let backgroundGroup = null;
    let oldSelectedLine = null;
    let isDragging = false;

    let currentDrawingState = DrawingStates.none;
    let currentDrawingChannelType = null;
    let currentDrawingLine = null;

    $('.element-palette .createChannelIcon').parent().css('color', lineColor[ChannelTypes.normal]);
    $('.element-palette .createCloggableChannelIcon').parent().css('color', lineColor[ChannelTypes.cloggable]);
    $('.element-palette .createBypassChannelIcon').parent().css('color', lineColor[ChannelTypes.bypass]);

    canvas.setHeight(canvasContainer.height());
    canvas.setWidth(canvasContainer.width());
    canvas.calcOffset();

    window.onresize = () => {
        canvas.setHeight(canvasContainer.height());
        canvas.setWidth(canvasContainer.width());
        canvas.calcOffset();
        redrawBackground();
    };

    function redrawBackground() {
        let prevTop = 0;
        let prevLeft = 0;
        if(backgroundGroup) {
            prevTop = backgroundGroup.top;
            prevLeft = backgroundGroup.left;
            canvas.remove(backgroundGroup);
        }

        let gridLines = [];
        const gridOverlap = 5;

        for (let i = -gridOverlap; i < (canvasContainer.width() / grid) + gridOverlap; i++) {
            let verticalGridLine = new fabric.Line([ i * grid, -gridOverlap * grid, i * grid, canvasContainer.height() + gridOverlap * grid], {
                stroke: '#eeeeee',
                selectable: false,
            });
            gridLines.push(verticalGridLine);
        }
        for (let i = -gridOverlap; i < (canvasContainer.height() / grid) + gridOverlap; i++) {
            let horizontalGridLine = new fabric.Line([ -gridOverlap * grid, i * grid,  canvasContainer.width() + gridOverlap * grid, i * grid], {
                stroke: '#eeeeee',
                selectable: false
            });
            gridLines.push(horizontalGridLine);
        }

        backgroundGroup = new fabric.Group(gridLines, {
            selectable: false,
            evented: false,
        });
        canvas.add(backgroundGroup);
        backgroundGroup.sendToBack();

        let panHintText = new fabric.Text('Alt + Drag to move around', {
            left: canvasContainer.width() / 2 - 260,
            top: canvasContainer.height() - 200,
            opacity: 0.22,
            absolutePositioned: true
        });

        let delHintText = new fabric.Text('Del key to remove selected element', {
            left: canvasContainer.width() / 2 - 320,
            top: canvasContainer.height() - 150,
            opacity: 0.25,
            absolutePositioned: true
        });

        backgroundGroup.addWithUpdate(panHintText);
        backgroundGroup.addWithUpdate(delHintText);
        backgroundGroup.left = prevLeft;
        backgroundGroup.top = prevTop;
    }

    redrawBackground();

    canvas.on('mouse:down', opt => {
        if (opt.e.altKey === true) {
            isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = opt.e.clientX;
            canvas.lastPosY = opt.e.clientY;
        } else if(currentDrawingState === DrawingStates.ready) {
            //region start drawing line
            currentDrawingState = DrawingStates.started;

            if(opt.target && opt.target.type === 'circle') {
                let points = [
                    opt.target.left + grid/2,
                    opt.target.top + grid/2,
                    opt.target.left + grid/2,
                    opt.target.top + grid/2,
                ];
                currentDrawingLine = makeLine(canvas, points, currentDrawingChannelType,{});
            } else {
                let pointer = canvas.getPointer(opt.e, false);
                let left = Math.floor(pointer.x / grid) * grid;
                let top = Math.floor(pointer.y / grid) * grid;
                let points = [left, top, left, top];
                currentDrawingLine = makeLine(canvas, points, currentDrawingChannelType,{});
            }
            //endregion
        } else if(currentDrawingState === DrawingStates.started) {
            //region end drawing line
            $('body').removeClass('drawing');
            canvas.hoverCursor = 'move';
            canvas.defaultCursor = 'default';

            currentDrawingState = DrawingStates.none;
            currentDrawingLine.setCoords();
            currentDrawingLine = null;
            mergeElements(canvas);
            //endregion
        } else if(opt.target != null && opt.target.type === 'line') {
            //region Select element and display information
            if(oldSelectedLine != null) {
                oldSelectedLine.set({ 'fill': lineColor[oldSelectedLine.channelType], 'stroke': lineColor[oldSelectedLine.channelType] });
            }

            opt.target.set({ 'fill': lineColorSelected[opt.target.channelType], 'stroke': lineColorSelected[opt.target.channelType] });
            oldSelectedLine = opt.target;

            let $elementPropertiesWindow = $('.element-properties');
            $elementPropertiesWindow.find('.empty-hint').hide();

            let linePropertyForm = $elementPropertiesWindow.find('.line-properties');

            let length, width, height;
            if(opt.target.properties == null) {
                opt.target.properties = {};
                length = width = height = 0;
            } else {
                length = opt.target.properties.length || 0;
                width  = opt.target.properties.width || 0;
                height = opt.target.properties.height || 0;
            }
            opt.target.properties.length = length;
            opt.target.properties.width = width;
            opt.target.properties.height = height;

            linePropertyForm.find('#length').val(length);
            linePropertyForm.find('#width').val(width);
            linePropertyForm.find('#height').val(height);
            linePropertyForm.data('objectProperties', opt.target.properties);
            linePropertyForm.show();
            //endregion
        }
    });

    $('.element-properties .property-form').on('input', 'input', (event) => {
        let $input = $(event.target);
        let objectProperties = $input.closest('.property-form').data('objectProperties');

        objectProperties[$input.attr('id')] = $input.val();
    });

    $('.element-palette .createChannelIcon').on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.normal;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });


    $('.element-palette .createCloggableChannelIcon').on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.cloggable;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });

    $('.element-palette .createBypassChannelIcon').on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.bypass;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });

    canvas.on('mouse:move', opt => {
        if (isDragging) {
            canvas.viewportTransform[4] += opt.e.clientX - canvas.lastPosX;
            canvas.viewportTransform[5] += opt.e.clientY - canvas.lastPosY;
            canvas.requestRenderAll();

            backgroundGroup.left -= opt.e.clientX - canvas.lastPosX;
            backgroundGroup.top -= opt.e.clientY - canvas.lastPosY;

            canvas.lastPosX = opt.e.clientX;
            canvas.lastPosY = opt.e.clientY;
        }

        if(currentDrawingState === DrawingStates.started) {
            let pointer = canvas.getPointer(opt.e, false);

            let left = Math.floor(pointer.x / grid) * grid;
            let top = Math.floor(pointer.y / grid) * grid;

            currentDrawingLine.set({ x2: left, y2: top });
            currentDrawingLine.endCircle.set({left: left - grid / 2, top: top - grid / 2});
            canvas.renderAll();
            currentDrawingLine.setCoords();
            currentDrawingLine.endCircle.setCoords();
        }
    });

    canvas.on('mouse:up', () => {
        if(isDragging) {
            isDragging = false;
            canvas.selection = true;
            canvas.getObjects().forEach(value => {
                value.setCoords();
            });
        }
    });

    $(document).keyup(function(e){
        // 46 = DELETE key
        if(e.keyCode === 46 && oldSelectedLine != null) {
            $('.element-properties .property-form').hide();
            $('.element-properties .empty-hint').show();
            deleteLine(canvas, oldSelectedLine);
            oldSelectedLine = null;
        }
    });

    makeLine(canvas, [ 100, 100, 200, 100 ], ChannelTypes.normal, {});
    makeLine(canvas, [ 200, 100, 200, 50 ], ChannelTypes.normal, {});
    makeLine(canvas, [ 200, 100, 200, 150 ], ChannelTypes.normal, {});
    makeLine(canvas, [ 200, 150, 300, 150 ], ChannelTypes.normal, {});
    makeLine(canvas, [ 200, 50, 300, 50 ], ChannelTypes.normal, {});
    makeLine(canvas, [ 300, 50, 300, 100 ], ChannelTypes.normal, {});
    makeLine(canvas, [ 300, 150, 300, 100 ], ChannelTypes.normal, {});
    makeLine(canvas, [ 300, 100, 400, 100 ], ChannelTypes.normal, {});

    mergeElements(canvas);
    
    canvas.on('object:moving', function(e) {
        if(currentDrawingState !== DrawingStates.none) return;
        let circle = e.target;

        let left = Math.floor(circle.left / grid) * grid;
        let top = Math.floor(circle.top / grid) * grid;

        circle.set({
            left: left - grid/2,
            top: top - grid/2
        });

        circle.lines.forEach(value => {
            if(value.pos === 'start') {
                value.line.set({ 'x1': left, 'y1': top });
            } else if(value.pos === 'end') {
                value.line.set({ 'x2': left, 'y2': top });
            } else {
                console.error('Circle to move did not match any end of the connected line');
            }
        });
        canvas.renderAll();
        canvas.getObjects().forEach(value => {
            value.setCoords();
        });
    });

    canvas.on('object:moved', () => {
        mergeElements(canvas);
    });

})();

function makeLine(canvas, coords, channelType, properties) {
    let line = new fabric.Line(coords, {
        fill: lineColor[channelType],
        stroke: lineColor[channelType],
        strokeWidth: 12,
        selectable: false,
        evented: true,
        hoverCursor : 'default',
        perPixelTargetFind: true,
    });
    line.channelType = channelType;
    line.hasControls = line.hasBorders = false;

    let startCircle = new fabric.Circle({
        left: coords[0] - grid/2,
        top: coords[1] - grid/2,
        strokeWidth: 5,
        radius: 10,
        fill: '#fff',
        stroke: '#666'
    });
    startCircle.pos = 'start';
    startCircle.lines = [{line: line, pos: startCircle.pos}];
    startCircle.hasControls = startCircle.hasBorders = false;

    let endCircle = new fabric.Circle({
        left: coords[2] - grid/2,
        top: coords[3] - grid/2,
        strokeWidth: 5,
        radius: 10,
        fill: '#fff',
        stroke: '#666'
    });

    endCircle.pos = 'end';
    endCircle.lines = [{line: line, pos: endCircle.pos}];
    endCircle.hasControls = endCircle.hasBorders = false;

    canvas.add(line);
    canvas.add(startCircle);
    canvas.add(endCircle);

    line.properties = properties;
    line.startCircle = startCircle;
    line.endCircle = endCircle;
    return line;
}

function mergeElements(canvas) {
    let circles = {};

    canvas.getObjects().forEach(value => {
        if(value.type === 'circle') {
            if(circles[value.left] && circles[value.left][value.top]) {
                value.lines.forEach(lineWithPosInfo => {
                    circles[value.left][value.top].lines.push(lineWithPosInfo);
                    if (value === lineWithPosInfo.line.startCircle) {
                        lineWithPosInfo.line.startCircle = circles[value.left][value.top];
                    } else {
                        lineWithPosInfo.line.endCircle = circles[value.left][value.top];
                    }
                });
                canvas.remove(value);
                circles[value.left][value.top].bringToFront();
                return;
            }

            if(!circles[value.left]) {
                circles[value.left] = {};
            }
            circles[value.left][value.top] = value;
        } else if(value.type === 'line') {
            if(value.x1 === value.x2 && value.y1 === value.y2) {
                canvas.remove(value);
            }
        }
    })
}

function deleteLine(canvas, line) {
    if(line.startCircle.lines.length === 1) {
        canvas.remove(line.startCircle);
    } else {
        line.startCircle.lines = line.startCircle.lines.filter(value => {
            return value.line !== line;
        });
    }

    if(line.endCircle.lines.length === 1) {
        canvas.remove(line.endCircle);
    } else {
        line.endCircle.lines = line.endCircle.lines.filter(value => {
            return value.line !== line;
        });
    }

    canvas.remove(line);
}

