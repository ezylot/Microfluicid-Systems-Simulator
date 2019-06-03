$(document).ready(() => {
    $('.phase-properties input#interfacialTensionInput').on('change', event => { phaseProperties.interfactialTension = parseInt(event.target.value); });
    $('.phase-properties input#slipInput').on('change', event => { phaseProperties.slip = parseInt(event.target.value); });
    $('.phase-properties select#contPhaseFluid').on('change', event => { phaseProperties.contPhaseFluid = parseInt(event.target.value); });
    $('.phase-properties select#disptPhaseFluid').on('change', event => { phaseProperties.disptPhaseFluid = parseInt(event.target.value); });
});

function setPhaseProperties(newPhaseProperties) {
    phaseProperties = newPhaseProperties;

    $('.phase-properties input#interfacialTensionInput').val(phaseProperties.interfactialTension);
    $('.phase-properties input#slipInput').val(phaseProperties.slip);
    $('.phase-properties select#contPhaseFluid').val(phaseProperties.contPhaseFluid);
    $('.phase-properties select#disptPhaseFluid').val(phaseProperties.disptPhaseFluid);
}
