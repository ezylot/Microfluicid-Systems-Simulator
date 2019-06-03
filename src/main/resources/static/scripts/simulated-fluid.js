class SimulatedFluid {

    /**
     * Represents a simulated fluid that runs though the channels
     * @param startChannel Channel where the start of the fluid is
     * @param startPercentage Value where the fluid starts [0; 1]
     * @param endChannel Channel where the end of the fluid is
     * @param endPercentage Value where the fluid ends [0; 1]
     */
    constructor(startChannel, startPercentage, endChannel, endPercentage) {
        this._startChannel = startChannel;
        this._startPercentage = startPercentage;
        this._endChannel = endChannel;
        this._endPercentage = endPercentage;

        this._fluidColor = '#51d6d2';
        this._drawnGroup = null;
    }


    get startPercentage() {
        return this._startPercentage;
    }

    get endPercentage() {
        return this._endPercentage;
    }

    /**
     * Draws this SimulatedFluid as a line on the canvas
     * @param {fabric.Canvas} canvas The canvas on which the fluid should be drawn
     */
    draw(canvas) {

        if(this._drawnGroup != null) {
            canvas.remove(this._drawnGroup);
            this._drawnGroup = null;
        }

        if(this._startChannel === this._endChannel) {
            let start = {x: this._startChannel.x1, y: this._startChannel.y1};
            let end = {x: this._startChannel.x2, y: this._startChannel.y2};
            let vector = {x: end.x - start.x, y: end.y - start.y};

            let coords = [
                start.x + this._startPercentage * vector.x,
                start.y + this._startPercentage * vector.y,
                start.x + this._endPercentage * vector.x,
                start.y + this._endPercentage * vector.y,
            ];

            let simulatedFluid = new fabric.Line(coords, {
                fill: this._fluidColor,
                stroke: this._fluidColor,
                strokeWidth: this._startChannel.strokeWidth,
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                represents: 'SimulatedFluid',
                originX: 'center',
                originY: 'center',
            });

            let startCircle = new fabric.Circle({
                left: coords[0],
                top: coords[1],
                radius: this._startChannel.strokeWidth / 2,
                fill: this._fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let endCircle = new fabric.Circle({
                left: coords[2],
                top: coords[3],
                radius: this._startChannel.strokeWidth / 2,
                fill: this._fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let simulatedFluidGroup = new fabric.Group([ startCircle, simulatedFluid, endCircle ], {
                selectable: false,
                evented: false,
                represents: 'simulatedDroplet'
            });

            this._drawnGroup = simulatedFluidGroup;
            canvas.add(simulatedFluidGroup);
            simulatedFluidGroup.bringToFront();
        } else {
            let otherStartCircle = null;
            let cornerCircle = null;
            let otherEndCircle = null;

            if(this._startChannel.endCircle.lines.map(a => a.line).indexOf(this._endChannel) !== -1) {
                otherStartCircle = this._startChannel.startCircle;
                cornerCircle = this._startChannel.endCircle;
            } else if(this._startChannel.startCircle.lines.map(a => a.line).indexOf(this._endChannel) !== -1) {
                otherStartCircle = this._startChannel.endCircle;
                cornerCircle = this._startChannel.startCircle;
            } else {
                throw "The 2 channels must be either equal or be connected by a single corner";
            }

            if(this._endChannel.startCircle === cornerCircle) {
                otherEndCircle = this._endChannel.endCircle;
            } else {
                otherEndCircle = this._endChannel.startCircle;
            }


            let vectorStart = {x: cornerCircle.left - otherStartCircle.left, y: cornerCircle.top - otherStartCircle.top};
            let vectorEnd = {x: otherEndCircle.left - cornerCircle.left, y: otherEndCircle.top - cornerCircle.top};

            let coordsLine1 = [
                otherStartCircle.left + this._startPercentage * vectorStart.x,
                otherStartCircle.top + this._startPercentage * vectorStart.y,
                cornerCircle.left,
                cornerCircle.top
            ];

            let coordsLine2 = [
                cornerCircle.left,
                cornerCircle.top,
                cornerCircle.left + this._endPercentage * vectorEnd.x,
                cornerCircle.top + this._endPercentage * vectorEnd.y
            ];

            let simulatedFluidPart1 = new fabric.Line(coordsLine1, {
                fill: this._fluidColor,
                stroke: this._fluidColor,
                strokeWidth: this._startChannel.strokeWidth,
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                represents: 'SimulatedFluid',
                originX: 'center',
                originY: 'center',
            });

            let simulatedFluidPart2 = new fabric.Line(coordsLine2, {
                fill: this._fluidColor,
                stroke: this._fluidColor,
                strokeWidth: this._startChannel.strokeWidth,
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                represents: 'SimulatedFluid',
                originX: 'center',
                originY: 'center',
            });

            let startCircle = new fabric.Circle({
                left: coordsLine1[0],
                top: coordsLine1[1],
                radius: this._startChannel.strokeWidth / 2,
                fill: this._fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let endCircle = new fabric.Circle({
                left: coordsLine2[2],
                top: coordsLine2[3],
                radius: this._startChannel.strokeWidth / 2,
                fill: this._fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let simulatedFluidGroup = new fabric.Group([ startCircle, simulatedFluidPart1, simulatedFluidPart2, endCircle ], {
                selectable: false,
                evented: false
            });

            this._drawnGroup = simulatedFluidGroup;
            canvas.add(simulatedFluidGroup);
            simulatedFluidGroup.bringToFront();
        }
    }

    remove(canvas) {
        if(this._drawnGroup != null) {
            canvas.remove(this._drawnGroup);
            this._drawnGroup = null;
        }
    }

    changePosition(startChannel, startPercentage, endChannel, endPercentage) {
        this._startChannel = startChannel;
        this._startPercentage = startPercentage;
        this._endChannel = endChannel;
        this._endPercentage = endPercentage;
    }

}
