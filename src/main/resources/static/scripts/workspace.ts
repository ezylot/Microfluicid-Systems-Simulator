import {Canvas, Circle, Text, Line, Group} from "fabric/fabric-impl";
import {Pump} from "./classes/Pump";
import * as $ from "jquery";
import {defaultValues} from "./defaultvalue";
import {Channel} from "./classes/Channel";
import {ChannelLine} from "./fabricElements/ChannelLine";
import {ChannelEndCircle} from "./fabricElements/ChannelEndCircle";
import {BackgroundLine} from "./fabricElements/BackgroundLine";
import {updatePump} from "./dropletInjections";
import KeyUpEvent = JQuery.KeyUpEvent;


const grid = 10;
export enum DrawingStates {
    'none' = 1,
    'ready' = 2,
    'started' = 3
}

export enum ChannelTypes {
    'normal' = 'normal',
    'cloggable' = 'cloggable',
    'bypass' = 'bypass'
}

export enum PumpTypes {
    'pressure' = 'pressure',
    'volume' = 'volume',
    'drain' = 'drain'
}

const lineColor: any = { };
lineColor[ChannelTypes.normal]= '#9c9c9c';
lineColor[ChannelTypes.cloggable]= '#70719c';
lineColor[ChannelTypes.bypass]= '#9c5872';

const lineColorSelected: any = { };
lineColorSelected[ChannelTypes.normal] = '#689c52';
lineColorSelected[ChannelTypes.cloggable] = '#50429c';
lineColorSelected[ChannelTypes.bypass] = '#9c3540';

const pumpColor: any = { };
pumpColor[PumpTypes.pressure]= '#c0c634';
pumpColor[PumpTypes.volume]= '#46c2c2';
pumpColor[PumpTypes.drain]= '#3e202e';

const pumpColorSelected: any = { };
pumpColorSelected[PumpTypes.pressure] = '#e5eb3f';
pumpColorSelected[PumpTypes.volume] = '#50e3e3';
pumpColorSelected[PumpTypes.drain] = '#915269';

let nextPumpId = 0;

let pumps: Pump[] = [];
const canvasToSave = new Canvas('c', {selection: false});

let lastPosX = 0;
let lastPosY = 0;


function getLengthFormatted(line: Line): string {
    return Math.sqrt(Math.pow(line.x1 - line.x2, 2) + Math.pow(line.y1 - line.y2, 2)).toFixed(2);
}

function calculateRadius(): number {
    return defaultValues.width / 2 + 6;
}

function calculatePumpRadius(): number {
    return defaultValues.width / 2 + 10;
}

export function makeChannel(channel: Channel): ChannelLine {
    let line = new ChannelLine([channel.x1, channel.y1, channel.x2, channel.y2], {
        fill: lineColor[channel.channelType],
        stroke: lineColor[channel.channelType],
        strokeWidth: channel.properties.width || defaultValues.width,
        selectable: false,
        evented: true,
        hoverCursor : 'default',
        perPixelTargetFind: true,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
        objectCaching: false
    }, channel.channelType);


    let startCircle = new ChannelEndCircle([new Circle({
        left: channel.x1,
        top: channel.y1,
        strokeWidth: 5,
        radius: calculateRadius(),
        fill: '#fff',
        stroke: '#666',
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center'
    })], {
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
    });

    startCircle.pos = 'start';
    startCircle.lines = [{line: line, pos: 'start'}];

    let endCircle = new ChannelEndCircle([new Circle({
        left: channel.x2,
        top: channel.y2,
        strokeWidth: 5,
        radius: calculateRadius(),
        fill: '#fff',
        stroke: '#666',
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center',
    })], {
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
    });

    endCircle.pos = 'end';
    endCircle.lines = [{line: line, pos: 'end'}];

    canvasToSave.add(line);
    canvasToSave.add(startCircle);
    canvasToSave.add(endCircle);

    line.properties = $.extend({}, channel.properties, {
        height: defaultValues.height,
        width: defaultValues.width,
    });
    line.startCircle = startCircle;
    line.endCircle = endCircle;
    return line;
}

export function mergeElements(canvas: Canvas): void {
    let circles: Map<number, Map<number, ChannelEndCircle>> = new Map();

    canvas.getObjects().forEach((value: ChannelEndCircle | ChannelLine): void => {
        if (value.represents === 'endCircle') {
            let endCircle: ChannelEndCircle = (value as ChannelEndCircle);
            if(!!circles.get(endCircle.left) && !!circles.get(endCircle.left).get(endCircle.top)) {
                let storedCircle = circles.get(endCircle.left).get(endCircle.top);
                endCircle.lines.forEach((lineWithPosInfo): void => {
                    storedCircle.lines.push(lineWithPosInfo);
                    if(endCircle === lineWithPosInfo.line.startCircle) {
                        lineWithPosInfo.line.startCircle = storedCircle;
                    } else {
                        lineWithPosInfo.line.endCircle = storedCircle;
                    }
                });
                canvas.remove(endCircle);
                storedCircle.bringToFront();
                return;
            }

            if (!circles.get(endCircle.left)) {
                circles.set(endCircle.left, new Map());
            }
            circles.get(endCircle.left).set(endCircle.top, endCircle);
        } else if (value.represents === 'line') {
            let channel: ChannelLine = (value as ChannelLine);
            if (channel.x1 === channel.x2 && channel.y1 === channel.y2) {
                canvas.remove(channel);
            }
        }
    });

    if(canvas.getObjects("circle").length === 1) {
        canvas.remove(canvas.getObjects("circle")[0]);
    }
}

function deleteLine(canvas: Canvas, line: ChannelLine): void {
    if(line.startCircle.lines.length === 1) {
        canvas.remove(line.startCircle);
    } else {
        line.startCircle.lines = line.startCircle.lines.filter((value): boolean => {
            return value.line !== line;
        });
    }

    if(line.endCircle.lines.length === 1) {
        canvas.remove(line.endCircle);
    } else {
        line.endCircle.lines = line.endCircle.lines.filter((value): boolean => {
            return value.line !== line;
        });
    }

    canvas.remove(line);
}

function deletePump(element: ChannelEndCircle): void {
    let indexToDelete = pumps.findIndex((value: Pump): boolean => value.id === element.properties.id);
    pumps.splice(indexToDelete, 1);

    $(`#newPumpSelection option[value=${element.properties.id}]`).remove();
    $(`#pumpSelection option[value=${element.properties.id}]`).remove();

    element.represents = element.oldRepresents;
    element.properties = null;
    (element.getObjects()[0] as Circle).set({
        radius: calculateRadius(),
        fill: '#fff',
        stroke: '#666',
    });

    if(element.getObjects().length >= 2) {
        element.remove(element.getObjects()[1]);
    }
}

export function createPumpElement(pumpGroup: ChannelEndCircle, pumpType: PumpTypes, pump: Pump): void {
    let pumpCircle = pumpGroup.getObjects()[0] as Circle;

    if(pumpType === PumpTypes.drain) {
        pump.pumpName = 'D' + pump.id;
        pump.type = PumpTypes.drain;
        pumpCircle.set({
            radius: calculatePumpRadius(),
            stroke: '#cbcbcb',
            fill: pumpColor.drain,
        });

        pumpGroup.set({
            oldRepresents: 'endCircle',
            represents: 'pump',
            pumpType: PumpTypes.drain,
            properties: pump,
        });
    } else if(pumpType === PumpTypes.pressure) {

        pump.pumpValue = pump.pumpValue || defaultValues.pressure;
        pump.pumpName = pump.pumpName || 'P' + pump.id;
        pump.type = PumpTypes.pressure;
        pumpCircle.set({
            radius: calculatePumpRadius(),
            stroke: '#cbcbcb',
            fill: pumpColor.pressure,
        });

        pumpGroup.set({
            oldRepresents: 'endCircle',
            represents: 'pump',
            pumpType: PumpTypes.pressure,
            properties: pump,
        });

        pumpGroup.addWithUpdate(new Text('P', {
            originX: 'center',
            originY: 'center',
            left: pumpGroup.left,
            top: pumpGroup.top,
            fontSize: 20
        }));
    } else {
        pump.pumpValue = pump.pumpValue || defaultValues.volume;
        pump.pumpName = pump.pumpName || 'V' + pump.id;
        pump.type = PumpTypes.volume;

        pumpCircle.set({
            radius: calculatePumpRadius(),
            stroke: '#cbcbcb',
            fill: pumpColor.volume,
        });

        pumpGroup.set({
            oldRepresents: 'endCircle',
            represents: 'pump',
            pumpType: PumpTypes.volume,
            properties: pump,
        });

        pumpGroup.addWithUpdate(new Text('V', {
            originX: 'center',
            originY: 'center',
            left: pumpGroup.left,
            top: pumpGroup.top,
            fontSize: 20
        }));
    }
}

export function createPump(newPump: Pump): void {
    if(newPump.id >= nextPumpId) {
        nextPumpId = newPump.id + 1;
    }

    pumps.push(newPump);

    if(newPump.type !== PumpTypes.drain) {
        $('#newPumpSelection').append($('<option>')
            .attr('value', newPump.id)
            .text(newPump.pumpName)
        );
        $('#pumpSelection').append($('<option>')
            .attr('value', newPump.id)
            .text(newPump.pumpName)
        );
    }
}

function resetOldSelection(oldSelectedElem: any): void {
    if(oldSelectedElem === null) return;

    if(oldSelectedElem.represents === 'line') {
        let channel: ChannelLine = (oldSelectedElem as ChannelLine);
        channel.fill = lineColor[channel.channelType];
        channel.stroke = lineColor[channel.channelType];
    } else if(oldSelectedElem.represents === 'pump') {
        let endCircle: ChannelEndCircle = (oldSelectedElem as ChannelEndCircle);
        endCircle.getObjects()[0].set({
            'fill': pumpColor[endCircle.pumpType],
        });
    } else {
        console.error('Wrong type to reset')
    }
    canvasToSave.renderAll();
}

jQuery((): void => {
    let canvasContainer = $('.workspace');
    let backgroundGroup: Group = null;
    let oldSelectedElem: any = null;
    let isDragging = false;

    let currentDrawingState = DrawingStates.none;
    let currentDrawingChannelType: ChannelTypes = null;
    let currentDrawingPumpType: PumpTypes = null;
    let currentDrawingLine: ChannelLine = null;

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

    canvasToSave.setHeight(canvasContainer.height());
    canvasToSave.setWidth(canvasContainer.width());
    canvasToSave.calcOffset();
    canvasToSave.selection = false;

    function redrawBackground(): void {
        if (backgroundGroup) {
            canvasToSave.remove(backgroundGroup);
        }

        let gridLines = [];
        const gridOverlap = 10;

        for (let i = -gridOverlap; i < (canvasContainer.width() / grid / canvasToSave.getZoom()) + gridOverlap; i++) {
            let verticalGridLine = new BackgroundLine([i * grid, -gridOverlap * grid, i * grid, canvasContainer.height() / canvasToSave.getZoom() + gridOverlap * grid], {
                stroke: '#eeeeee',
                selectable: false,
            }, 'backgroundline');
            gridLines.push(verticalGridLine);
        }

        for (let i = -gridOverlap; i < (canvasContainer.height() / grid / canvasToSave.getZoom()) + gridOverlap; i++) {
            let horizontalGridLine = new BackgroundLine([-gridOverlap * grid, i * grid, canvasContainer.width() / canvasToSave.getZoom() + gridOverlap * grid, i * grid], {
                stroke: '#eeeeee',
                selectable: false,
            }, 'backgroundline');
            gridLines.push(horizontalGridLine);
        }

        backgroundGroup = new Group(gridLines, {
            selectable: false,
            evented: false
        });
        canvasToSave.add(backgroundGroup);
        backgroundGroup.sendToBack();

        let panHintText = new Text('Alt + Drag to move around', {
            left: canvasContainer.width() / 2 - 260,
            top: canvasContainer.height() - 250,
            opacity: 0.22,
            absolutePositioned: true
        });

        let delHintText = new Text('Del key to remove selected element', {
            left: canvasContainer.width() / 2 - 320,
            top: canvasContainer.height() - 200,
            opacity: 0.25,
            absolutePositioned: true
        });

        let spaceHint = new Text('Space key to reset zoom and pan', {
            left: canvasContainer.width() / 2 - 300,
            top: canvasContainer.height() - 150,
            opacity: 0.25,
            absolutePositioned: true
        });


        backgroundGroup.addWithUpdate(panHintText);
        backgroundGroup.addWithUpdate(delHintText);
        backgroundGroup.addWithUpdate(spaceHint);

        backgroundGroup.set({
            left: - canvasToSave.viewportTransform[4],
            top: - canvasToSave.viewportTransform[5]
        });
        backgroundGroup.setCoords();
        canvasToSave.renderAll();
    }

    window.onresize = (): void => {
        canvasToSave.setHeight(canvasContainer.height());
        canvasToSave.setWidth(canvasContainer.width());
        canvasToSave.calcOffset();
        redrawBackground();
    };

    redrawBackground();

    canvasToSave.on('mouse:down', (opt: any): void => {
        if (opt.e.altKey === true) {
            isDragging = true;
            lastPosX = opt.e.clientX;
            lastPosY = opt.e.clientY;
        } else if (currentDrawingChannelType !== null) {
            if (currentDrawingState === DrawingStates.ready) {
                //region start drawing line
                currentDrawingState = DrawingStates.started;
                canvasToSave.getObjects().forEach((value): void => {
                    value.lockMovementX = value.lockMovementY = true
                });

                if (opt.target && opt.target.represents === 'endCircle') {
                    let endCircle: ChannelEndCircle = opt.target as ChannelEndCircle;
                    currentDrawingLine = makeChannel(new Channel(
                        currentDrawingChannelType,
                        endCircle.left,
                        endCircle.top,
                        endCircle.left,
                        endCircle.top,
                        {})
                    );
                } else {
                    let pointer = canvasToSave.getPointer(opt.e, false);
                    let left = Math.round(pointer.x / grid) * grid;
                    let top = Math.round(pointer.y / grid) * grid;
                    currentDrawingLine = makeChannel(new Channel(currentDrawingChannelType, left, top, left, top, {}));
                }
                //endregion
            } else if (currentDrawingState === DrawingStates.started) {
                //region end drawing line
                currentDrawingLine.setCoords();
                mergeElements(canvasToSave);

                let newStartingCoordsLeft = currentDrawingLine.endCircle.left;
                let newStartingCoordsTop = currentDrawingLine.endCircle.top;

                currentDrawingLine = makeChannel(new Channel(
                    currentDrawingChannelType,
                    newStartingCoordsLeft,
                    newStartingCoordsTop,
                    newStartingCoordsLeft,
                    newStartingCoordsTop,
                    {}
                ));
                //endregion
            }
        } else if (currentDrawingPumpType !== null) {
            if (currentDrawingState === DrawingStates.ready && opt.target && (opt.target.represents === 'endCircle' || opt.target.represents === 'pump') ) {
                let pumpGroup: ChannelEndCircle = opt.target as ChannelEndCircle;

                if(pumpGroup.represents === 'pump') {
                    if(oldSelectedElem === pumpGroup) {
                        $('.element-properties .property-form').hide();
                        $('.element-properties .empty-hint').show();
                    }
                    deletePump(pumpGroup);
                }

                $('body').removeClass('drawing');
                canvasToSave.hoverCursor = 'move';
                canvasToSave.defaultCursor = 'default';

                let pump = new Pump(pumpGroup.top, pumpGroup.left, nextPumpId++, null, null, currentDrawingPumpType);

                createPumpElement(pumpGroup, currentDrawingPumpType, pump);
                createPump(pump);

                currentDrawingState = DrawingStates.none;
                currentDrawingLine = null;
                currentDrawingPumpType = null;

                canvasToSave.renderAll();
            }
        } else if (opt.target != null && opt.target.represents === 'line') {
            //region Select channel element and display information
            resetOldSelection(oldSelectedElem);

            opt.target.set({
                'fill': lineColorSelected[opt.target.channelType],
                'stroke': lineColorSelected[opt.target.channelType]
            });
            canvasToSave.renderAll();
            oldSelectedElem = opt.target;

            let $elementPropertiesWindow = $('.element-properties');
            $elementPropertiesWindow.find('.empty-hint').hide();
            $elementPropertiesWindow.find('.pump-properties').hide();

            let linePropertyForm = $elementPropertiesWindow.find('.line-properties');

            let width, height;
            if (opt.target.properties == null) {
                opt.target.properties = {};
                width = defaultValues.width;
                height = defaultValues.height;
            } else {
                width = opt.target.properties.width || 0;
                height = opt.target.properties.height || 0;
            }
            opt.target.properties.width = width;
            opt.target.properties.height = height;

            linePropertyForm.find('#length').val(getLengthFormatted(opt.target));
            linePropertyForm.find('#width').val(width);
            linePropertyForm.find('#height').val(height);
            linePropertyForm.data('objectProperties', opt.target.properties);
            linePropertyForm.show();
            //endregion
        } else if (opt.target != null && opt.target.represents === 'pump') {
            //region Select pump element and display information
            resetOldSelection(oldSelectedElem);

            opt.target.getObjects()[0].set({
                'fill': pumpColorSelected[opt.target.pumpType],
            });
            canvasToSave.renderAll();
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

    $('.element-properties .property-form').on('input', 'input', (event): void => {
        let $input = $(event.target);
        let objectProperties = $input.closest('.property-form').data('objectProperties');
        objectProperties[$input.attr('id')] = $input.val();

        if($input.is($('.element-properties .property-form.line-properties input[name=width]'))) {
            console.assert(!!oldSelectedElem);
            oldSelectedElem.set('strokeWidth', objectProperties.width);
            canvasToSave.renderAll();
        }

        if($input.attr('id') === 'pumpName' || $input.attr('id') === 'pumpValue') {
            updatePump(objectProperties);
        }
    });

    $createChannelElement.on('click', (): void => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.normal;
        currentDrawingPumpType = null;
        $('body').addClass('drawing');
        canvasToSave.hoverCursor = 'crosshair';
        canvasToSave.defaultCursor = 'crosshair';
    });


    $createCloggableChannelElement.on('click', (): void  => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.cloggable;
        currentDrawingPumpType = null;
        $('body').addClass('drawing');
        canvasToSave.hoverCursor = 'crosshair';
        canvasToSave.defaultCursor = 'crosshair';
    });

    $createBypassChannelElement.on('click', (): void  => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = ChannelTypes.bypass;
        currentDrawingPumpType = null;
        $('body').addClass('drawing');
        canvasToSave.hoverCursor = 'crosshair';
        canvasToSave.defaultCursor = 'crosshair';
    });

    $createPressurePumpElement.on('click', (): void  => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = null;
        currentDrawingPumpType = PumpTypes.pressure;
        $('body').addClass('drawing');
        canvasToSave.hoverCursor = 'crosshair';
        canvasToSave.defaultCursor = 'crosshair';
    });

    $createVolumePumpElement.on('click', (): void  => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = null;
        currentDrawingPumpType = PumpTypes.volume;
        $('body').addClass('drawing');
        canvasToSave.hoverCursor = 'crosshair';
        canvasToSave.defaultCursor = 'crosshair';
    });

    $createDrainPumpElement.on('click', (): void  => {
        currentDrawingState = DrawingStates.ready;
        currentDrawingChannelType = null;
        currentDrawingPumpType = PumpTypes.drain;
        $('body').addClass('drawing');
        canvasToSave.hoverCursor = 'crosshair';
        canvasToSave.defaultCursor = 'crosshair';
    });

    canvasToSave.on('mouse:move', (opt: any): void  => {
        if (isDragging) {
            canvasToSave.viewportTransform[4] += opt.e.clientX - lastPosX;
            canvasToSave.viewportTransform[5] += opt.e.clientY - lastPosY;
            canvasToSave.requestRenderAll();

            lastPosX = opt.e.clientX;
            lastPosY = opt.e.clientY;
        }

        if (currentDrawingState === DrawingStates.started) {
            let pointer = canvasToSave.getPointer(opt.e, false);

            let left = Math.round(pointer.x / grid) * grid;
            let top = Math.round(pointer.y / grid) * grid;

            currentDrawingLine.set({x2: left, y2: top});
            currentDrawingLine.endCircle.set({left: left, top: top});
            canvasToSave.renderAll();
            currentDrawingLine.setCoords();
            currentDrawingLine.endCircle.setCoords();
        }
    });

    canvasToSave.on('mouse:up', (): void  => {
        if (isDragging) {
            isDragging = false;
            redrawBackground();
            canvasToSave.getObjects().forEach((value): void  => {
                value.setCoords();
            });
        }
    });

    canvasToSave.on('mouse:wheel', (opt: any): void => {
        let delta = opt.e.deltaY;
        delta = delta * -1;
        let zoom = canvasToSave.getZoom();
        zoom = zoom + delta / 1000;
        if (zoom > 10) zoom = 10;
        if (zoom < 0.1) zoom = 0.1;
        canvasToSave.setZoom(zoom);
        redrawBackground();
        opt.e.preventDefault();
        opt.e.stopPropagation();
    });

    $(document).on('keyup', (e: KeyUpEvent): void => {
        // 46 = DELETE key, 27 = ESCAPE KEY, 32 = SPACE

        if (e.keyCode === 27 && currentDrawingState === DrawingStates.started) {
            $('body').removeClass('drawing');
            canvasToSave.hoverCursor = 'move';
            canvasToSave.defaultCursor = 'default';

            currentDrawingState = DrawingStates.none;
            canvasToSave.getObjects().forEach((value): void => {
                value.lockMovementX = value.lockMovementY = false
            });

            deleteLine(canvasToSave, currentDrawingLine);
            currentDrawingLine = null;
            currentDrawingChannelType = null;
        }


        if (e.keyCode === 27 && currentDrawingPumpType !== null) {
            $('body').removeClass('drawing');
            canvasToSave.hoverCursor = 'move';
            canvasToSave.defaultCursor = 'default';

            currentDrawingPumpType = null;
        }

        if (e.keyCode === 46 && oldSelectedElem != null && e.target.tagName !== "INPUT") {
            $('.element-properties .property-form').hide();
            $('.element-properties .empty-hint').show();
            if(oldSelectedElem.represents === 'line') {
                deleteLine(canvasToSave, oldSelectedElem);
            } else if(oldSelectedElem.represents === 'pump') {
                deletePump(oldSelectedElem);
            }
            oldSelectedElem = null;
            canvasToSave.renderAll();
        }

        if (e.keyCode === 32) {
            canvasToSave.viewportTransform[4] = canvasToSave.viewportTransform[5] = lastPosX = lastPosY = 0;
            canvasToSave.setZoom(1);
            redrawBackground();
        }
    });

    canvasToSave.on('object:moving', (e): void => {
        let circle = e.target as ChannelEndCircle;

        let left = Math.round(circle.left / grid) * grid;
        let top = Math.round(circle.top / grid) * grid;

        circle.set({
            left: left,
            top: top
        });

        circle.lines.forEach((value): void => {
            if (value.pos === 'start') {
                value.line.set({'x1': left, 'y1': top});
            } else if (value.pos === 'end') {
                value.line.set({'x2': left, 'y2': top});
            } else {
                console.error('Circle to move did not match any end of the connected line');
            }

            if(oldSelectedElem === value.line) {
                $('.element-properties').find('.line-properties').find('#length').val(getLengthFormatted(value.line));
            }
        });
        canvasToSave.renderAll();
        canvasToSave.getObjects().forEach((value): void => {
            value.setCoords();
        });
    });

    canvasToSave.on('object:moved', (): void => {
        mergeElements(canvasToSave);
    });
});


export {
    canvasToSave,
    pumps
}
