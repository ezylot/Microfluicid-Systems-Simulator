$(document).ready(() => {
    $('input#default-width').val(defaultValues.width).on('change', event => { defaultValues.width = parseInt(event.target.value); });
    $('input#default-height').val(defaultValues.height).on('change', event => { defaultValues.height = parseInt(event.target.value); });
    $('input#default-pressure-pumpValue').val(defaultValues.pressure).on('change', event => { defaultValues.pressure = parseInt(event.target.value); });
    $('input#default-volume-pumpValue').val(defaultValues.volume).on('change', event => { defaultValues.volume = parseInt(event.target.value); });
});

function setDefaultValues(newDefaultValues) {
    defaultValues = newDefaultValues;
    $('input#default-width').val(defaultValues.width);
    $('input#default-height').val(defaultValues.height);
    $('input#default-pressure-pumpValue').val(defaultValues.pressure);
    $('input#default-volume-pumpValue').val(defaultValues.volume);
}
