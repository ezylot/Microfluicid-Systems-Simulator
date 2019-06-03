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
    canvasToSave = canvas;

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
        if (backgroundGroup) {
            canvas.remove(backgroundGroup);
        }

        let gridLines = [];
        const gridOverlap = 10;

        for (let i = -gridOverlap; i < (canvasContainer.width() / grid / canvas.getZoom()) + gridOverlap; i++) {
            let verticalGridLine = new fabric.Line([i * grid, -gridOverlap * grid, i * grid, canvasContainer.height() / canvas.getZoom() + gridOverlap * grid], {
                stroke: '#eeeeee',
                selectable: false,
                represents: 'backgroundline'
            });
            gridLines.push(verticalGridLine);
        }
        for (let i = -gridOverlap; i < (canvasContainer.height() / grid / canvas.getZoom()) + gridOverlap; i++) {
            let horizontalGridLine = new fabric.Line([-gridOverlap * grid, i * grid, canvasContainer.width() / canvas.getZoom() + gridOverlap * grid, i * grid], {
                stroke: '#eeeeee',
                selectable: false,
                represents: 'backgroundline'
            });
            gridLines.push(horizontalGridLine);
        }

        backgroundGroup = new fabric.Group(gridLines, {
            selectable: false,
            evented: false
        });
        canvas.add(backgroundGroup);
        backgroundGroup.sendToBack();

        let panHintText = new fabric.Text('Alt + Drag to move around', {
            left: canvasContainer.width() / 2 - 260,
            top: canvasContainer.height() - 250,
            opacity: 0.22,
            absolutePositioned: true
        });

        let delHintText = new fabric.Text('Del key to remove selected element', {
            left: canvasContainer.width() / 2 - 320,
            top: canvasContainer.height() - 200,
            opacity: 0.25,
            absolutePositioned: true
        });

        let spaceHint = new fabric.Text('Space key to reset zoom and pan', {
            left: canvasContainer.width() / 2 - 300,
            top: canvasContainer.height() - 150,
            opacity: 0.25,
            absolutePositioned: true
        });


        backgroundGroup.addWithUpdate(panHintText);
        backgroundGroup.addWithUpdate(delHintText);
        backgroundGroup.addWithUpdate(spaceHint);

        backgroundGroup.set({
            left: - canvas.viewportTransform[4],
            top: - canvas.viewportTransform[5]
        });
        backgroundGroup.setCoords();
        canvas.renderAll();
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
                    currentDrawingLine = makeChannel(canvas, points, currentDrawingChannelType, {});
                } else {
                    let pointer = canvas.getPointer(opt.e, false);
                    let left = Math.round(pointer.x / grid) * grid;
                    let top = Math.round(pointer.y / grid) * grid;
                    let points = [left, top, left, top];
                    currentDrawingLine = makeChannel(canvas, points, currentDrawingChannelType, {});
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

                currentDrawingLine = makeChannel(canvas, points, currentDrawingChannelType, {});
                //endregion
            }
        } else if (currentDrawingPumpType !== null) {
            if (currentDrawingState === DrawingStates.ready && opt.target && opt.target.represents === 'endCircle') {
                $('body').removeClass('drawing');
                canvas.hoverCursor = 'move';
                canvas.defaultCursor = 'default';

                let pumpGroup = opt.target;

                let pump = {
                    top: pumpGroup.top,
                    left: pumpGroup.left,
                    id: nextPumpId++,
                };

                createPumpElement(pumpGroup, currentDrawingPumpType, pump);
                createPump(pump, pumps);

                currentDrawingState = DrawingStates.none;
                currentDrawingLine = null;
                currentDrawingPumpType = null;

                canvas.renderAll();
            } else  if(currentDrawingState === DrawingStates.ready && opt.target && opt.target.represents === 'endCircle'){
                // TODO: change pump type
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

            opt.target._objects[0].set({
                'fill': pumpColorSelected[opt.target.pumpType],
            });
            canvas.renderAll();
            oldSelectedElem = opt.target;

            let $elementPropertiesWindow = $('.element-properties');
            $elementPropertiesWindow.find('.empty-hint').hide();
            $elementPropertiesWindow.find('.line-properties').hide();

            let pumpPropertiesForm = $elementPropertiesWindow.find('.pump-properties');

            if(opt.target.pumpType === PumpTypes.drain) {
                pumpPropertiesForm.hide();
                $elementPropertiesWindow.find('.empty-hint').show();
                return;
            }

            pumpPropertiesForm.find('#pumpValue').val(opt.target.properties.pumpValue);
            pumpPropertiesForm.find('#pumpName').val(opt.target.properties.pumpName);

            if(opt.target.pumpType === PumpTypes.pressure) {
                pumpPropertiesForm.find('#pressure-value-label').show();
                pumpPropertiesForm.find('#pressure-value-unit').show();
                pumpPropertiesForm.find('#volume-value-label').hide();
                pumpPropertiesForm.find('#volume-value-unit').hide();
            } else {
                pumpPropertiesForm.find('#pressure-value-label').hide();
                pumpPropertiesForm.find('#pressure-value-unit').hide();
                pumpPropertiesForm.find('#volume-value-label').show();
                pumpPropertiesForm.find('#volume-value-unit').show();
            }
            pumpPropertiesForm.data('objectProperties', opt.target.properties);
            pumpPropertiesForm.show();
            //endregion
        }
    });

    $('.element-properties .property-form').on('input', 'input', (event) => {
        let $input = $(event.target);
        let objectProperties = $input.closest('.property-form').data('objectProperties');
        objectProperties[$input.attr('id')] = $input.val();

        if($input.is($('.element-properties .property-form.line-properties input[name=width]'))) {
            console.assert(!!oldSelectedElem);
            oldSelectedElem.strokeWidth = objectProperties.width;
            canvas.renderAll();
        }
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
            redrawBackground();
            canvas.getObjects().forEach(value => {
                value.setCoords();
            });
        }
    });

    canvas.on('mouse:wheel', function (opt) {
        let delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom = zoom + delta / 1000;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;
        canvas.setZoom(zoom);
        redrawBackground();
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    $(document).keyup(function (e) {
        // 46 = DELETE key, 27 = ESCAPE KEY, 32 = SPACE

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
            currentDrawingChannelType = null;
        }


        if (e.keyCode === 27 && currentDrawingPumpType !== null) {
            $('body').removeClass('drawing');
            canvas.hoverCursor = 'move';
            canvas.defaultCursor = 'default';

            currentDrawingPumpType = null;
        }

        if (e.keyCode === 46 && oldSelectedElem != null && e.target.tagName !== "INPUT") {
            $('.element-properties .property-form').hide();
            $('.element-properties .empty-hint').show();
            if(oldSelectedElem.represents === 'line') {
                deleteLine(canvas, oldSelectedElem);
            } else if(oldSelectedElem.represents === 'pump') {

                pumps.splice(pumps.indexOf(oldSelectedElem.properties), 1);

                oldSelectedElem.represents = oldSelectedElem.oldRepresents;
                oldSelectedElem.properties = null;
                oldSelectedElem._objects[0].set({
                    radius: calculateRadius(),
                    fill: '#fff',
                    stroke: '#666',
                });

                if(oldSelectedElem._objects.length >= 2) {
                    oldSelectedElem.remove(oldSelectedElem._objects[1]);
                }
            }
            oldSelectedElem = null;
            canvas.renderAll();
        }

        if (e.keyCode === 32) {
            canvas.viewportTransform[4] = canvas.viewportTransform[5] = canvas.lastPosX = canvas.lastPosY = 0;
            canvas.setZoom(1);
            redrawBackground();
        }
    });

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

    console.log("done");
    /*

    let channel1 = makeChannel(canvas, [100, 100, 400, 200], ChannelTypes.normal, {});
    let channel2 = makeChannel(canvas, [400, 200, 700, 600], ChannelTypes.normal, {});
    let channel3 = makeChannel(canvas, [100, 100, 800, 100], ChannelTypes.normal, {});
    mergeElements(canvas);

    let simulatedFluid1 = new SimulatedFluid(channel1, 0.1, channel1, 0.3);
    let simulatedFluid2 = new SimulatedFluid(channel1, 0.5, channel2, 0.6);
    let simulatedFluid3 = new SimulatedFluid(channel3, 0.1, channel3, 0.2);

    simulatedFluid1.draw(canvas);
    simulatedFluid2.draw(canvas);
    simulatedFluid3.draw(canvas);

    let fluidMover = window.setInterval(function() {
        simulatedFluid3.changePosition(
            channel3,
            simulatedFluid3.startPercentage + 0.003,
            channel3,
            simulatedFluid3.endPercentage + 0.003
        );
        simulatedFluid3.draw(canvas)


        if(simulatedFluid3.endPercentage > 0.9) {
            window.clearInterval(fluidMover);
        }
    }, 50);

    */

})();

function makeChannel(canvas, coords, channelType, properties) {
    let line = new fabric.Line(coords, {
        fill: lineColor[channelType],
        stroke: lineColor[channelType],
        strokeWidth: defaultValues.width,
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

    let startCircle = new fabric.Group([new fabric.Circle({
        left: coords[0],
        top: coords[1],
        strokeWidth: 5,
        radius: calculateRadius(),
        fill: '#fff',
        stroke: '#666',
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center'
    })], {
        represents: 'endCircle',
        pos: 'start',
        lines: [{line: line, pos: 'start'}],
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
    });

    let endCircle = new fabric.Group([new fabric.Circle({
        left: coords[2],
        top: coords[3],
        strokeWidth: 5,
        radius: calculateRadius(),
        fill: '#fff',
        stroke: '#666',
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
    })], {
        represents: 'endCircle',
        pos: 'end',
        lines: [{line: line, pos: 'end'}],
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
    });

    canvas.add(line);
    canvas.add(startCircle);
    canvas.add(endCircle);

    line.properties = $.extend({}, properties, {
        height: defaultValues.height,
        length: defaultValues.length,
        width: defaultValues.width,
    });
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

function createPumpElement(pumpGroup, pumpType, pump) {
    let pumpCircle = pumpGroup._objects[0];

    if(pumpType === PumpTypes.drain) {
        pump.pumpName = 'D' + pump.id;
        pump.type = PumpTypes.drain;
        pumpCircle.set({
            radius: calculatePumpRadius(),
            stroke: '#cbcbcb',
            fill: pumpColor.drain,
        });

        pumpGroup.set({
            oldRepresents: pumpGroup.represents,
            represents: 'pump',
            pumpType: PumpTypes.drain,
            properties: pump,
        });
    } else if(pumpType === PumpTypes.pressure) {

        pump.pumpValue = defaultValues.pressure;
        pump.pumpName = 'P' + pump.id;
        pump.type = PumpTypes.pressure;
        pumpCircle.set({
            radius: calculatePumpRadius(),
            stroke: '#cbcbcb',
            fill: pumpColor.pressure,
        });

        pumpGroup.set({
            oldRepresents: pumpGroup.represents,
            represents: 'pump',
            pumpType: PumpTypes.pressure,
            properties: pump,
        });

        pumpGroup.addWithUpdate(new fabric.Text('P', {
            originX: 'center',
            originY: 'center',
            left: pumpGroup.left,
            top: pumpGroup.top,
            fontSize: 20
        }));
    } else {
        pump.pumpValue = defaultValues.volume;
        pump.pumpName = 'V' + pump.id;
        pump.type = PumpTypes.volume;

        pumpCircle.set({
            radius: calculatePumpRadius(),
            stroke: '#cbcbcb',
            fill: pumpColor.volume,
        });

        pumpGroup.set({
            oldRepresents: pumpGroup.represents,
            represents: 'pump',
            pumpType: PumpTypes.volume,
            properties: pump,
        });

        pumpGroup.addWithUpdate(new fabric.Text('V', {
            originX: 'center',
            originY: 'center',
            left: pumpGroup.left,
            top: pumpGroup.top,
            fontSize: 20
        }));
    }
}

function createPump(newPump, pumps) {
    pumps.push(newPump);
    $('#newPumpSelection').append($('<option>').attr('value', newPump.id).text(newPump.pumpName));
    $('#pumpSelection').append($('<option>').attr('value', newPump.id).text(newPump.pumpName));
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

function calculateRadius() {
    return defaultValues.width / 2 + 6;
}

function calculatePumpRadius() {
    return defaultValues.width / 2 + 10;
}
