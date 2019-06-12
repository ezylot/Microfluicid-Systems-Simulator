import {ChannelTypes} from "../workspace";

export class Channel {
    public channelType: ChannelTypes;
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;
    public properties: {
        width?: number;
        height?: number;
    };

    public constructor(channelType: ChannelTypes, x1: number, y1: number, x2: number, y2: number, properties: { width?: number; height?: number }) {
        this.channelType = channelType;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.properties = properties;
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
