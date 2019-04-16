const grid = 10;
const DrawingStates = Object.freeze({ 'none': 1, 'ready': 2, 'started': 3 });
const ChannelTypes = Object.freeze({ 'normal': 'normal', 'cloggable': 'cloggable', 'bypass': 'bypass' });
const PumpTypes = Object.freeze({ 'pressure': 'pressure', 'volume': 'volume', 'drain': 'drain' });

const lineColor = { };
lineColor[ChannelTypes.normal]= '#9c9c9c';
lineColor[ChannelTypes.cloggable]= '#70719c';
lineColor[ChannelTypes.bypass]= '#9c5872';

const lineColorSelected = { };
lineColorSelected[ChannelTypes.normal] = '#689c52';
lineColorSelected[ChannelTypes.cloggable] = '#50429c';
lineColorSelected[ChannelTypes.bypass] = '#9c3540';

const pumpColor = { };
pumpColor[PumpTypes.pressure]= '#c0c634';
pumpColor[PumpTypes.volume]= '#46c2c2';
pumpColor[PumpTypes.drain]= '#3e202e';

const pumpColorSelected = { };
pumpColorSelected[PumpTypes.pressure] = '#e5eb3f';
pumpColorSelected[PumpTypes.volume] = '#50e3e3';
pumpColorSelected[PumpTypes.drain] = '#915269';

let nextPumpId = 0;

(function () {
    const canvas = new fabric.Canvas('c', {selection: false});

    let canvasContainer = $('.workspace');
    let backgroundGroup = null;
    let oldSelectedElem = null;
    let isDragging = false;

    let currentDrawingState = DrawingStates.none;
    let currentDrawingChannelType = null;
    let currentDrawingPumpType = null;
    let currentDrawingLine = null;

    let $createChannelElement = $('.element-palette .createChannelIcon');
    $createChannelElement
        .css('cursor', 'pointer')
        .css('color', lineColor[ChannelTypes.normal]);

    let $createCloggableChannelElement = $('.element-palette .createCloggableChannelIcon');
    $createCloggableChannelElement
        .css('cursor', 'pointer')
        .css('color', lineColor[ChannelTypes.cloggable]);

    let $createBypassChannelElement = $('.element-palette .createBypassChannelIcon');
    $createBypassChannelElement
        .css('cursor', 'pointer')
        .css('color', lineColor[ChannelTypes.bypass]);

    let $createPressurePumpElement = $('.element-palette .createPressurePumpIcon');
    let $createVolumePumpElement = $('.element-palette .createVolumePumpIcon');
    let $createDrainPumpElement = $('.element-palette .createDrainIcon');

    canvas.setHeight(canvasContainer.height());
    canvas.setWidth(canvasContainer.width());
    canvas.calcOffset();
    canvas.selection = false;

    window.onresize = () => {
        canvas.setHeight(canvasContainer.height());
        canvas.setWidth(canvasContainer.width());
        canvas.calcOffset();
        redrawBackground();
    };

    function redrawBackground() {
        let prevTop = 0;
        let prevLeft = 0;
        if (backgroundGroup) {
            prevTop = backgroundGroup.top;
            prevLeft = backgroundGroup.left;
            canvas.remove(backgroundGroup);
        }

        let gridLines = [];
        const gridOverlap = 5;

        for (let i = -gridOverlap; i < (canvasContainer.width() / grid) + gridOverlap; i++) {
            let verticalGridLine = new fabric.Line([i * grid, -gridOverlap * grid, i * grid, canvasContainer.height() + gridOverlap * grid], {
                stroke: '#eeeeee',
                selectable: false,
                represents: 'backgroundline'
            });
            gridLines.push(verticalGridLine);
        }
        for (let i = -gridOverlap; i < (canvasContainer.height() / grid) + gridOverlap; i++) {
            let horizontalGridLine = new fabric.Line([-gridOverlap * grid, i * grid, canvasContainer.width() + gridOverlap * grid, i * grid], {
                stroke: '#eeeeee',
                selectable: false,
                represents: 'backgroundline'
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
            canvas.lastPosX = opt.e.clientX;
            canvas.lastPosY = opt.e.clientY;
        } else if (currentDrawingChannelType !== null) {
            if (currentDrawingState === DrawingStates.ready) {
                //region start drawing line
                currentDrawingState = DrawingStates.started;
                canvas.getObjects().forEach(value => {
                    value.lockMovementX = value.lockMovementY = true
                });

                if (opt.target && opt.target.represents === 'endCircle') {
                    let points = [
                        opt.target.left,
                        opt.target.top,
                        opt.target.left,
                        opt.target.top,
                    ];
                    currentDrawingLine = makeLine(canvas, points, currentDrawingChannelType, {});
                } else {
                    let pointer = canvas.getPointer(opt.e, false);
                    let left = Math.round(pointer.x / grid) * grid;
                    let top = Math.round(pointer.y / grid) * grid;
                    let points = [left, top, left, top];
                    currentDrawingLine = makeLine(canvas, points, currentDrawingChannelType, {});
                }
                //endregion
            } else if (currentDrawingState === DrawingStates.started) {
                //region end drawing line
                currentDrawingLine.setCoords();
                mergeElements(canvas);

                let newStartingCoordsLeft = currentDrawingLine.endCircle.left;
                let newStartingCoordsTop = currentDrawingLine.endCircle.top;

                let points = [
                    newStartingCoordsLeft,
                    newStartingCoordsTop,
                    newStartingCoordsLeft,
                    newStartingCoordsTop,
                ];

                currentDrawingLine = makeLine(canvas, points, currentDrawingChannelType, {});
                //endregion
            }
        } else if (currentDrawingPumpType !== null) {
            if (currentDrawingState === DrawingStates.ready && opt.target && opt.target.represents === 'endCircle') {
                $('body').removeClass('drawing');
                canvas.hoverCursor = 'move';
                canvas.defaultCursor = 'default';

                let pump = {
                    id: nextPumpId++,
                };

                let pumpCircle = opt.target;
                if (currentDrawingPumpType === PumpTypes.volume) {
                    pumpCircle.set({
                        left: pumpCircle.left,
                        top: pumpCircle.top,
                        radius: 18,
                        stroke: '#cbcbcb',
                        fill: pumpColor.volume,
                        represents: 'pump',
                        pumpType: PumpTypes.volume
                    });
                    pump.name = 'V' + pump.id;
                    pump.type = PumpTypes.volume;
                } else if (currentDrawingPumpType === PumpTypes.pressure) {
                    pumpCircle.set({
                        left: pumpCircle.left,
                        top: pumpCircle.top,
                        radius: 18,
                        stroke: '#cbcbcb',
                        fill: pumpColor.pressure,
                        represents: 'pump',
                        pumpType: PumpTypes.pressure
                    });
                    pump.name = 'P' + pump.id;
                    pump.type = PumpTypes.pressure;
                } else {
                    pumpCircle.set({
                        left: pumpCircle.left,
                        top: pumpCircle.top,
                        radius: 18,
                        stroke: '#cbcbcb',
                        fill: pumpColor.drain,
                        represents: 'pump',
                        pumpType: PumpTypes.drain
                    });
                    pump.name = 'D' + pump.id;
                    pump.type = PumpTypes.drain;
                }

                createPump(pump, pumps);

                currentDrawingState = DrawingStates.none;
                currentDrawingLine = null;
                currentDrawingPumpType = null;

                canvas.renderAll();
            }
        } else if (opt.target != null && opt.target.represents === 'line') {
            //region Select channel element and display information
            resetOldSelection(oldSelectedElem);

            opt.target.set({
                'fill': lineColorSelected[opt.target.channelType],
                'stroke': lineColorSelected[opt.target.channelType]
            });
            canvas.renderAll();
            oldSelectedElem = opt.target;

            let $elementPropertiesWindow = $('.element-properties');
            $elementPropertiesWindow.find('.empty-hint').hide();
            $elementPropertiesWindow.find('.pump-properties').hide();

            let linePropertyForm = $elementPropertiesWindow.find('.line-properties');

            let length, width, height;
            if (opt.target.properties == null) {
                opt.target.properties = {};
                length = width = height = 0;
            } else {
                length = opt.target.properties.length || 0;
                width = opt.target.properties.width || 0;
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
        } else if (opt.target != null && opt.target.represents === 'pump') {
            //region Select pump element and display information
            resetOldSelection(oldSelectedElem);

            opt.target.set({
                'fill': pumpColorSelected[opt.target.pumpType],
            });
            canvas.renderAll();
            oldSelectedElem = opt.target;

            let $elementPropertiesWindow = $('.element-properties');
            $elementPropertiesWindow.find('.empty-hint').hide();
            $elementPropertiesWindow.find('.line-properties').hide();

            let pumpPropertiesForm = $elementPropertiesWindow.find('.pump-properties');

            if (opt.target.properties == null) {
                opt.target.properties = {};
                opt.target.properties.test = 123;
                // TODO set default values for pump
            }

            // TODO display pump values in detail window
            // TODO display pump name
            pumpPropertiesForm.find('#test').val(opt.target.properties.test);
            pumpPropertiesForm.data('objectProperties', opt.target.properties);
            pumpPropertiesForm.show();
            //endregion
        }
    });

    $('.element-properties .property-form').on('input', 'input', (event) => {
        let $input = $(event.target);
        let objectProperties = $input.closest('.property-form').data('objectProperties');

        objectProperties[$input.attr('id')] = $input.val();
    });

    $createChannelElement.on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.normal;
        currentDrawingPumpType = null;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });


    $createCloggableChannelElement.on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.cloggable;
        currentDrawingPumpType = null;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });

    $createBypassChannelElement.on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.bypass;
        currentDrawingPumpType = null;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });

    $createPressurePumpElement.on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = null;
        currentDrawingPumpType = PumpTypes.pressure;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });

    $createVolumePumpElement.on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = null;
        currentDrawingPumpType = PumpTypes.volume;
        $('body').addClass('drawing');
        canvas.hoverCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
    });

    $createDrainPumpElement.on('click', () => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = null;
        currentDrawingPumpType = PumpTypes.drain;
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

        if (currentDrawingState === DrawingStates.started) {
            let pointer = canvas.getPointer(opt.e, false);

            let left = Math.round(pointer.x / grid) * grid;
            let top = Math.round(pointer.y / grid) * grid;

            currentDrawingLine.set({x2: left, y2: top});
            currentDrawingLine.endCircle.set({left: left, top: top});
            canvas.renderAll();
            currentDrawingLine.setCoords();
            currentDrawingLine.endCircle.setCoords();
        }
    });

    canvas.on('mouse:up', () => {
        if (isDragging) {
            isDragging = false;
            canvas.getObjects().forEach(value => {
                value.setCoords();
            });
        }
    });

    $(document).keyup(function (e) {
        // 46 = DELETE key, 27 = ESCAPE KEY

        if (e.keyCode === 27 && currentDrawingState === DrawingStates.started) {
            $('body').removeClass('drawing');
            canvas.hoverCursor = 'move';
            canvas.defaultCursor = 'default';

            currentDrawingState = DrawingStates.none;
            canvas.getObjects().forEach(value => {
                value.lockMovementX = value.lockMovementY = false
            });

            deleteLine(canvas, currentDrawingLine);
            currentDrawingLine = null;
        }

        if (e.keyCode === 46 && oldSelectedElem != null && e.target.tagName !== "INPUT") {
            $('.element-properties .property-form').hide();
            $('.element-properties .empty-hint').show();
            if(oldSelectedElem.represents === 'line') {
                deleteLine(canvas, oldSelectedElem);
            } else {
                // TODO: delete pump and reset to normal node
            }
            oldSelectedElem = null;
        }
    });

    makeLine(canvas, [100, 100, 200, 100], ChannelTypes.normal, {});
    makeLine(canvas, [200, 100, 200, 50], ChannelTypes.normal, {});
    makeLine(canvas, [200, 100, 200, 150], ChannelTypes.cloggable, {});
    makeLine(canvas, [200, 150, 300, 150], ChannelTypes.cloggable, {});
    makeLine(canvas, [200, 50, 300, 50], ChannelTypes.cloggable, {});
    makeLine(canvas, [300, 50, 300, 100], ChannelTypes.bypass, {});
    makeLine(canvas, [300, 150, 300, 100], ChannelTypes.bypass, {});
    makeLine(canvas, [300, 100, 400, 100], ChannelTypes.bypass, {});

    mergeElements(canvas);

    canvas.on('object:moving', function (e) {
        let circle = e.target;

        let left = Math.round(circle.left / grid) * grid;
        let top = Math.round(circle.top / grid) * grid;

        circle.set({
            left: left,
            top: top
        });

        circle.lines.forEach(value => {
            if (value.pos === 'start') {
                value.line.set({'x1': left, 'y1': top});
            } else if (value.pos === 'end') {
                value.line.set({'x2': left, 'y2': top});
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
        hasControls: false,
        hasBorders: false,
        represents: 'line',
        originX: 'center',
        originY: 'center',
    });
    line.channelType = channelType;

    let startCircle = new fabric.Circle({
        left: coords[0],
        top: coords[1],
        strokeWidth: 5,
        radius: 10,
        fill: '#fff',
        stroke: '#666',
        hasControls: false,
        hasBorders: false,
        represents: 'endCircle',
        originX: 'center',
        originY: 'center',
    });
    startCircle.pos = 'start';
    startCircle.lines = [{line: line, pos: startCircle.pos}];

    let endCircle = new fabric.Circle({
        left: coords[2],
        top: coords[3],
        strokeWidth: 5,
        radius: 10,
        fill: '#fff',
        stroke: '#666',
        hasControls: false,
        hasBorders: false,
        represents: 'endCircle',
        originX: 'center',
        originY: 'center',
    });

    endCircle.pos = 'end';
    endCircle.lines = [{line: line, pos: endCircle.pos}];

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
        if (value.represents === 'endCircle') {
            if (circles[value.left] && circles[value.left][value.top]) {
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

            if (!circles[value.left]) {
                circles[value.left] = {};
            }
            circles[value.left][value.top] = value;
        } else if (value.represents === 'line') {
            if (value.x1 === value.x2 && value.y1 === value.y2) {
                canvas.remove(value);
            }
        }
    });

    if(canvas.getObjects("circle").length === 1) {
        canvas.remove(canvas.getObjects("circle")[0]);
    }
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

function createPump(newPump, pumps) {
    pumps.push(newPump);
    $('#newPumpSelection').append($('<option>').attr('value', newPump.id).text(newPump.name));
    $('#pumpSelection').append($('<option>').attr('value', newPump.id).text(newPump.name));
}

function resetOldSelection(oldSelectedElem) {
    if(oldSelectedElem === null) return;

    if(oldSelectedElem.represents === 'line') {
        oldSelectedElem.set({
            'fill': lineColor[oldSelectedElem.channelType],
            'stroke': lineColor[oldSelectedElem.channelType]
        });
    } else if(oldSelectedElem.represents === 'pump') {
        oldSelectedElem.set({
            'fill': pumpColor[oldSelectedElem.pumpType],
        });
    } else {
        console.error('Wrong type to reset')
    }
}
