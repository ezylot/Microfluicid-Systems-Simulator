import {PumpTypes} from "../workspace";

export class Pump {
    public top: number;
    public left: number;
    public id: number;
    public pumpValue: number;
    public pumpName: string;
    public type: PumpTypes;


    public constructor(top: number, left: number, id: number, pumpValue: number, pumpName: string, type: PumpTypes) {
        this.top = top;
        this.left = left;
        this.id = id;
        this.pumpValue = pumpValue;
        this.pumpName = pumpName;
        this.type = type;
    }

    public static cloneTyped(pump: Pump): Pump {
        return new Pump(
            pump.top,
            pump.left,
            pump.id,
            pump.pumpValue,
            pump.pumpName,
            pump.type
        )
    }
}
