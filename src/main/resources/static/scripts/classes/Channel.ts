import {Canvas, Circle} from "fabric/fabric-impl";
import {ChannelLine} from "../fabricElements/ChannelLine";
import {defaultValues} from "../defaultvalue";
import {ChannelEndCircle} from "../fabricElements/ChannelEndCircle";
import * as $ from "jquery";
import {deletePump} from "../workspace";

export enum ChannelType {
    'normal' = 'normal',
    'cloggable' = 'cloggable',
    'bypass' = 'bypass'
}

export class Channel {

    public static readonly LineColor =  {
        [ChannelType.normal]: '#a0a0a0',
        [ChannelType.cloggable]: '#0064ae',
        [ChannelType.bypass]: '#bd1614',
    };

    public static readonly LineColorSelected = {
        [ChannelType.normal]: '#666666',
        [ChannelType.cloggable]: '#004689',
        [ChannelType.bypass]: '#a70c14',
    };

    private channelLine: ChannelLine;
    public channelType: ChannelType;
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    public properties: {
        width?: number;
        height?: number;
    };

    public constructor(channelType: ChannelType, x1: number, y1: number, x2: number, y2: number, properties: { width?: number; height?: number }) {
        this.channelType = channelType;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.properties = properties;
    }

    public select(): void {
        this.channelLine.set({
            'fill': Channel.LineColorSelected[this.channelType],
            'stroke': Channel.LineColorSelected[this.channelType]
        })
    }

    public deselect(): void {
        this.channelLine.set({
            'fill': Channel.LineColor[this.channelType],
            'stroke': Channel.LineColor[this.channelType]
        })
    }

    public onCanvas(canvas: Canvas): ChannelLine  {
        let line = new ChannelLine([this.x1, this.y1, this.x2, this.y2], {
            fill: Channel.LineColor[this.channelType],
            stroke: Channel.LineColor[this.channelType],
            strokeWidth: this.properties.width || defaultValues.width,
            selectable: false,
            evented: false,
            hoverCursor: 'not-allowed',
            perPixelTargetFind: true,
            hasControls: false,
            hasBorders: false,
            originX: 'center',
            originY: 'center',
            objectCaching: false
        }, this);

        let startCircle = new ChannelEndCircle([new Circle({
            left: this.x1,
            top: this.y1,
            strokeWidth: 5,
            radius: defaultValues.calculateRadius(),
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
            left: this.x2,
            top: this.y2,
            strokeWidth: 5,
            radius: defaultValues.calculateRadius(),
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
            evented: false
        });

        endCircle.pos = 'end';
        endCircle.lines = [{line: line, pos: 'end'}];

        canvas.add(line);
        canvas.add(startCircle);
        canvas.add(endCircle);

        line.properties = $.extend({
            height: defaultValues.height,
            width: defaultValues.width,
        }, this.properties);
        line.startCircle = startCircle;
        line.endCircle = endCircle;

        this.channelLine = line;
        return line;
    }

    public remove(canvas: Canvas) {
        let line = this.channelLine;

        if (line.startCircle.lines.length === 1) {
            if (line.startCircle.represents === 'pump') {
                deletePump(line.startCircle);
            }
            canvas.remove(line.startCircle);
        } else {
            line.startCircle.lines = line.startCircle.lines.filter((value): boolean => {
                return value.line !== this.channelLine;
            });
        }

        if (line.endCircle.lines.length === 1) {
            if (line.endCircle.represents === 'pump') {
                deletePump(line.endCircle);
            }
            canvas.remove(line.endCircle);
        } else {
            line.endCircle.lines = line.endCircle.lines.filter((value): boolean => {
                return value.line !== this.channelLine;
            });
        }

        canvas.remove(line);
    }

    public static cloneTyped(channel: Channel): Channel  {
        return new Channel(
            channel.channelType,
            channel.x1,
            channel.y1,
            channel.x2,
            channel.y2,
            channel.properties
        );
    }
}
