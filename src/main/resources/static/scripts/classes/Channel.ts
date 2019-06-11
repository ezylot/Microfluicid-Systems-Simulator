export class Channel {
    public channelType: string;
    public x1: number;
    public x2: number;
    public y1: number;
    public y2: number;
    public properties: object;


    public constructor(channelType: string, x1: number, x2: number, y1: number, y2: number, properties: object) {
        this.channelType = channelType;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.properties = properties;
    }
}
