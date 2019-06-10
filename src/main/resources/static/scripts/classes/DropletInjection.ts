export class DropletInjection {
    public id: number;
    public dropletId: number;
    public injectionPumpId: number;
    public dropletName: string;
    public injectionPumpName: string;
    public injectionTime: number;

    public constructor(id: number, dropletId: number, injectionPumpId: number, dropletName: string, injectionPumpName: string, injectionTime: number) {
        this.id = id;
        this.dropletId = dropletId;
        this.injectionPumpId = injectionPumpId;
        this.dropletName = dropletName;
        this.injectionPumpName = injectionPumpName;
        this.injectionTime = injectionTime;
    }
}
