import * as $ from "jquery";
import ChangeEvent = JQuery.ChangeEvent;
import {PhaseProperties} from "./classes/PhaseProperties";

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
