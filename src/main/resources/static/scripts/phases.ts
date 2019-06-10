import * as $ from "jquery";
import ChangeEvent = JQuery.ChangeEvent;

class PhaseProperties {
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

const phaseProperties: PhaseProperties = new PhaseProperties(null, null, null, null);

export function setPhaseProperties(newPhaseProperties: PhaseProperties): void {
    phaseProperties.interfacialTension = newPhaseProperties._interfacialTension;
    phaseProperties.slip = newPhaseProperties._slip;
    phaseProperties.contPhaseFluid = newPhaseProperties._contPhaseFluid;
    phaseProperties.disptPhaseFluid = newPhaseProperties._disptPhaseFluid;

    $('.phase-properties input#interfacialTensionInput').val(phaseProperties.interfacialTension);
    $('.phase-properties input#slipInput').val(phaseProperties.slip);
    $('.phase-properties select#contPhaseFluid').val(phaseProperties.contPhaseFluid);
    $('.phase-properties select#disptPhaseFluid').val(phaseProperties.disptPhaseFluid);
}

jQuery((): void => {
    $('.phase-properties input#interfacialTensionInput').on('change', (event: ChangeEvent): void => { phaseProperties.interfacialTension = parseFloat(event.target.value); });
    $('.phase-properties input#slipInput').on('change', (event: ChangeEvent): void => { phaseProperties.slip = parseFloat(event.target.value); });
    $('.phase-properties select#contPhaseFluid').on('change', (event: ChangeEvent): void => { phaseProperties.contPhaseFluid = parseInt(event.target.value); });
    $('.phase-properties select#disptPhaseFluid').on('change', (event: ChangeEvent): void => { phaseProperties.disptPhaseFluid = parseInt(event.target.value); });
});

export {
    phaseProperties
}

// TODO: remove with ts rewrite
// @ts-ignore
window.phaseProperties = phaseProperties;
// @ts-ignore
window.setPhaseProperties = setPhaseProperties;
