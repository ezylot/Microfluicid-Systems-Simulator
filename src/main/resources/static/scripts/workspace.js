const grid = 10;
const lineColor = '#9c9c9c';
const lineColorSelected = '#689c52';
const DrawingStates = Object.freeze({ "none": 1, "ready": 2, "started": 3 });


(function() {
    const canvas = new fabric.Canvas('c', { selection: false });


    let canvasContainer = $('.workspace');
    let backgroundGroup = null;
    let oldSelectedLine = null;
    let isDragging = false;
    let currentDrawingState = DrawingStates.none;
    let currentDrawingLine = null;

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
                selectable: false
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
            let pointer = canvas.getPointer(opt.e, false);
            let left = Math.round(pointer.x / grid) * grid;
            let top = Math.round(pointer.y / grid) * grid;
            let points = [left, top, left, top];
            currentDrawingLine = makeLine(canvas, points, {});
            //endregion
        } else if(currentDrawingState === DrawingStates.started) {
            //region end drawing line
            $('body').removeClass('drawing');
            canvas.hoverCursor = 'move';
            canvas.defaultCursor = 'default';

            currentDrawingState = DrawingStates.none;
            currentDrawingLine = null;
            canvas.getObjects().forEach(value => {
                value.setCoords();
            });
            mergeCircles(canvas);
            //endregion
        } else if(opt.target != null && opt.target.type === 'line') {
            if(oldSelectedLine != null) {
                oldSelectedLine.set({ 'fill': lineColor, 'stroke': lineColor });
            }

            opt.target.set({ 'fill': lineColorSelected, 'stroke': lineColorSelected });
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
        }
    });

    $('.element-properties .property-form').on('input', 'input', (event) => {
        let $input = $(event.target);
        let objectProperties = $input.closest('.property-form').data('objectProperties');

        objectProperties[$input.attr('id')] = $input.val();
    });

    $('.element-palette .createChannelIcon').on('click', () => {
        currentDrawingState = DrawingStates.ready;
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

            let left = Math.round(pointer.x / grid) * grid;
            let top = Math.round(pointer.y / grid) * grid;

            currentDrawingLine.set({ x2: left, y2: top });
            currentDrawingLine.endCircle.set({left: left - grid / 2, top: top - grid / 2});
            canvas.renderAll();
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
        if(e.keyCode === 46 && oldSelectedLine != null) {
            $('.element-properties .property-form').hide();
            $('.element-properties .empty-hint').show();
            deleteLine(canvas, oldSelectedLine);
            oldSelectedLine = null;
        }
    });

    makeLine(canvas, [ 100, 100, 200, 100 ]);
    makeLine(canvas, [ 200, 100, 200, 50 ]);
    makeLine(canvas, [ 200, 100, 200, 150 ]);
    makeLine(canvas, [ 200, 150, 300, 150 ]);
    makeLine(canvas, [ 200, 50, 300, 50 ]);
    makeLine(canvas, [ 300, 50, 300, 100 ]);
    makeLine(canvas, [ 300, 150, 300, 100 ]);
    makeLine(canvas, [ 300, 100, 400, 100 ]);

    mergeCircles(canvas);
    
    canvas.on('object:moving', function(e) {
        let circle = e.target;

        let left = Math.round(circle.left / grid) * grid;
        let top = Math.round(circle.top / grid) * grid;

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
                console.error("Circle to move did not match any end of the connected line");
            }
        });
        canvas.renderAll();
    });

    canvas.on('object:moving', () => {
        mergeCircles(canvas);
    });

})();

function makeLine(canvas, coords, properties) {
    let line = new fabric.Line(coords, {
        fill: lineColor,
        stroke: lineColor,
        strokeWidth: 12,
        selectable: false,
        evented: true,
        hoverCursor : 'default',
    });
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

function mergeCircles(canvas) {
    let circles = {};

    canvas.getObjects().forEach(value => {
        if(value.type === 'circle') {
            if(circles[value.left] && circles[value.left][value.top]) {
                circles[value.left][value.top].lines = circles[value.left][value.top].lines.concat(value.lines);
                canvas.remove(value);
                circles[value.left][value.top].bringToFront();
                return;
            }

            if(!circles[value.left]) {
                circles[value.left] = {};
            }
            circles[value.left][value.top] = value;
        }
    })
}

function deleteLine(canvas, line) {
    canvas.getObjects().forEach(value => {
        if (value.type === 'circle') {
            value.lines = value.lines.filter(value => {
                return value.line !== line;
            });

            if(value.lines.length === 0) {
                canvas.remove(value);
            }
        }
    });
    canvas.remove(line);
}

