import {ILineOptions, Line} from "fabric/fabric-impl";
import {ChannelTypes} from "../workspace";
import {ChannelEndCircle} from "./ChannelEndCircle";

export class ChannelLine extends Line {

    public channelType: ChannelTypes;
    public represents = 'line';
    public properties: {
        height: number;
        width: number;
    };
    public startCircle: ChannelEndCircle;
    public endCircle: ChannelEndCircle;

    public constructor(points: number[], objObjects: ILineOptions, channelType: ChannelTypes) {
        super(points, objObjects);
        this.channelType = channelType;
    }
}
