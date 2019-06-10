export class PhaseProperties {
    public _interfacialTension: number;
    public _slip: number;
    public _contPhaseFluid: number;
    public _disptPhaseFluid: number;

    public constructor(interfacialTension: number, slip: number, contPhaseFluid: number, disptPhaseFluid: number) {
        this._interfacialTension = interfacialTension;
        this._slip = slip;
        this._contPhaseFluid = contPhaseFluid;
        this._disptPhaseFluid = disptPhaseFluid;
    }


    public get interfacialTension(): number {
        return this._interfacialTension;
    }

    public set interfacialTension(value: number) {
        this._interfacialTension = value;
    }

    public get slip(): number {
        return this._slip;
    }

    public set slip(value: number) {
        this._slip = value;
    }

    public get contPhaseFluid(): number {
        return this._contPhaseFluid;
    }

    public set contPhaseFluid(value: number) {
        this._contPhaseFluid = value;
    }

    public get disptPhaseFluid(): number {
        return this._disptPhaseFluid;
    }

    public set disptPhaseFluid(value: number) {
        this._disptPhaseFluid = value;
    }
}
