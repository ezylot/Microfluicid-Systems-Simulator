import {Canvas, ILineOptions, Line} from "fabric/fabric-impl";
import {ChannelEndCircle} from "./ChannelEndCircle";
import {Channel} from "../classes/Channel";
import {canvasToSave} from "../workspace";

export class ChannelLine extends Line {

    public channel: Channel;
    public represents = 'line';
    public properties: {
        height: number;
        width: number;
    };
    public startCircle: ChannelEndCircle;
    public endCircle: ChannelEndCircle;

    public constructor(points: number[], objObjects: ILineOptions, channel: Channel) {
        super(points, objObjects);
        this.channel = channel;
    }

    public static fromCanvas(canvas: Canvas): ChannelLine[] {
        return canvasToSave.getObjects('line') as ChannelLine[];
    }
}
