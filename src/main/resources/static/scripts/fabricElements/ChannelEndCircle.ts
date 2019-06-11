import { Group, IGroupOptions } from "fabric/fabric-impl";
import {ChannelLine} from "./ChannelLine";
import {PumpTypes} from "../workspace";
import {Pump} from "../classes/Pump";

export class ChannelEndCircle extends Group {

    public oldRepresents: (null | 'endCircle');
    public pumpType: (null | PumpTypes);
    public properties: (null | Pump);

    public represents: ('endCircle' | 'pump');
    public pos: ( 'start' | 'end');
    public lines: {
        line: ChannelLine;
        pos: ( 'start' | 'end');
    }[];

    public constructor(objects: fabric.Object[], options: IGroupOptions) {
        super(objects, options);
        this.oldRepresents = null;
        this.pumpType = null;
        this.properties = null;
        this.represents = "endCircle";
    }
}
