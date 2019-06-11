export class Pump {
    public top: number;
    public left: number;
    public id: number;
    public pumpValue: number;
    public pumpName: string;
    public type: string;


    public constructor(top: number, left: number, id: number, pumpValue: number, pumpName: string, type: string) {
        this.top = top;
        this.left = left;
        this.id = id;
        this.pumpValue = pumpValue;
        this.pumpName = pumpName;
        this.type = type;
    }
}
