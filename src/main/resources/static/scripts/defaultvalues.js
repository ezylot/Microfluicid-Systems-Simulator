$(document).ready(() => {
    $('input#default-width').on('change', event => { defaultValues.width = parseInt(event.target.value); });
    $('input#default-height').on('change', event => { defaultValues.height = parseInt(event.target.value); });
    $('input#default-pressure-pumpValue').on('change', event => { defaultValues.pressure = parseInt(event.target.value); });
    $('input#default-volume-pumpValue').on('change', event => { defaultValues.volume = parseInt(event.target.value); });
});
