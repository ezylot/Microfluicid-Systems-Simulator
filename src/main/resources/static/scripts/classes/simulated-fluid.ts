class SimulatedFluid {
    private startChannel: fabric.Line | any;
    private startPercentage: number;

    private endChannel: fabric.Line | any;
    private endPercentage: number;

    private fluidColor: string;
    private drawnGroup: fabric.Group;

    /**
     * Represents a simulated fluid that runs though the channels
     * @param startChannel Channel where the start of the fluid is
     * @param startPercentage Value where the fluid starts [0; 1]
     * @param endChannel Channel where the end of the fluid is
     * @param endPercentage Value where the fluid ends [0; 1]
     */
    public constructor(startChannel: fabric.Line, startPercentage: number, endChannel: fabric.Line, endPercentage: number) {
        this.startChannel = startChannel;
        this.startPercentage = startPercentage;
        this.endChannel = endChannel;
        this.endPercentage = endPercentage;

        this.fluidColor = '#51d6d2';
        this.drawnGroup = null;
    }

    public setColor(newColor: string): void {
        this.fluidColor = newColor;
    }

    /**
     * Draws this SimulatedFluid as a line on the canvas
     * @param {fabric.Canvas} canvas The canvas on which the fluid should be drawn
     */
    public draw(canvas: fabric.Canvas): void {
        if(this.startChannel === this.endChannel) {
            let start = { x: this.startChannel.x1, y: this.startChannel.y1 };
            let end = { x: this.startChannel.x2, y: this.startChannel.y2 };
            let vector = { x: end.x - start.x, y: end.y - start.y };

            let coords = [
                start.x + this.startPercentage * vector.x,
                start.y + this.startPercentage * vector.y,
                start.x + this.endPercentage * vector.x,
                start.y + this.endPercentage * vector.y,
            ];
            if(this.drawnGroup != null) {
                canvas.remove(this.drawnGroup);
            }

            let simulatedFluid = new fabric.Line(coords, {
                stroke: this.fluidColor,
                fill: this.fluidColor,
                strokeWidth: this.startChannel.strokeWidth,
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center'
            });

            let startCircle = new fabric.Circle({
                left: coords[0],
                top: coords[1],
                radius: this.startChannel.strokeWidth / 2,
                fill: this.fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let endCircle = new fabric.Circle({
                left: coords[2],
                top: coords[3],
                radius: this.startChannel.strokeWidth / 2,
                fill: this.fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let groupOptions = {
                selectable: false,
                evented: false,
                represents: 'simulatedDroplet'
            };

            this.drawnGroup = new fabric.Group([ startCircle, simulatedFluid, endCircle ], groupOptions);
            canvas.add(this.drawnGroup);
        } else {
            if(this.drawnGroup != null) {
                canvas.remove(this.drawnGroup);
            }

            let otherStartCircle = null;
            let cornerCircle = null;
            let otherEndCircle = null;

            if(this.startChannel.endCircle.lines.map((a: any) => a.line).indexOf(this.endChannel) !== -1) {
                otherStartCircle = this.startChannel.startCircle;
                cornerCircle = this.startChannel.endCircle;
            } else if(this.startChannel.startCircle.lines.map((a: any) => a.line).indexOf(this.endChannel) !== -1) {
                otherStartCircle = this.startChannel.endCircle;
                cornerCircle = this.startChannel.startCircle;
            } else {
                throw "The 2 channels must be either equal or be connected by a single corner";
            }

            if(this.endChannel.startCircle === cornerCircle) {
                otherEndCircle = this.endChannel.endCircle;
            } else {
                otherEndCircle = this.endChannel.startCircle;
            }


            let vectorStart = {
                x: cornerCircle.left - otherStartCircle.left,
                y: cornerCircle.top - otherStartCircle.top
            };
            let vectorEnd = { x: otherEndCircle.left - cornerCircle.left, y: otherEndCircle.top - cornerCircle.top };

            let coordsLine1 = [
                otherStartCircle.left + this.startPercentage * vectorStart.x,
                otherStartCircle.top + this.startPercentage * vectorStart.y,
                cornerCircle.left,
                cornerCircle.top
            ];

            let coordsLine2 = [
                cornerCircle.left,
                cornerCircle.top,
                cornerCircle.left + this.endPercentage * vectorEnd.x,
                cornerCircle.top + this.endPercentage * vectorEnd.y
            ];

            let simulatedFluidPart1 = new fabric.Line(coordsLine1, {
                fill: this.fluidColor,
                stroke: this.fluidColor,
                strokeWidth: this.startChannel.strokeWidth,
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let simulatedFluidPart2 = new fabric.Line(coordsLine2, {
                fill: this.fluidColor,
                stroke: this.fluidColor,
                strokeWidth: this.startChannel.strokeWidth,
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let startCircle = new fabric.Circle({
                left: coordsLine1[0],
                top: coordsLine1[1],
                radius: this.startChannel.strokeWidth / 2,
                fill: this.fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let endCircle = new fabric.Circle({
                left: coordsLine2[2],
                top: coordsLine2[3],
                radius: this.startChannel.strokeWidth / 2,
                fill: this.fluidColor,
                hasControls: false,
                hasBorders: false,
                originX: 'center',
                originY: 'center',
            });

            let simulatedFluidGroup = new fabric.Group([ startCircle, simulatedFluidPart1, simulatedFluidPart2, endCircle ], {
                selectable: false,
                evented: false
            });

            this.drawnGroup = simulatedFluidGroup;
            canvas.add(simulatedFluidGroup);
        }
        this.drawnGroup.bringToFront();
        canvas.renderAll();
    }

    public remove(canvas: fabric.Canvas): void {
        if(this.drawnGroup != null) {
            canvas.remove(this.drawnGroup);
            this.drawnGroup = null;
        }
    }

    public changePosition(startChannel: fabric.Line, startPercentage: number, endChannel: fabric.Line, endPercentage: number): void {
        this.startChannel = startChannel;
        this.startPercentage = startPercentage;
        this.endChannel = endChannel;
        this.endPercentage = endPercentage;
    }

}
