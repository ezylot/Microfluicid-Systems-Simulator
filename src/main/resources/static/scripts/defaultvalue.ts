import * as $ from "jquery";
import ChangeEvent = JQuery.ChangeEvent;
import {DefaultValues} from "./classes/DefaultValues";


const defaultDefaultValues: DefaultValues = new DefaultValues(16, 16, 3000, 0);
const defaultValues: DefaultValues = defaultDefaultValues;

jQuery((): void => {
    $('input#default-width').val(defaultValues.width).on('change', (event: ChangeEvent): void => { defaultValues.width = parseInt(event.target.value); });
    $('input#default-height').val(defaultValues.height).on('change', (event: ChangeEvent): void => { defaultValues.height = parseInt(event.target.value); });
    $('input#default-pressure-pumpValue').val(defaultValues.pressure).on('change', (event: ChangeEvent): void => { defaultValues.pressure = parseInt(event.target.value); });
    $('input#default-volume-pumpValue').val(defaultValues.volume).on('change', (event: ChangeEvent): void => { defaultValues.volume = parseInt(event.target.value); });
});


export function setDefaultValues(newDefaultValues: DefaultValues): void {
    defaultValues.width = newDefaultValues._width;
    defaultValues.height = newDefaultValues._height;
    defaultValues.pressure = newDefaultValues._pressure;
    defaultValues.volume = newDefaultValues._volume;

    $('input#default-width').val(defaultValues.width);
    $('input#default-height').val(defaultValues.height);
    $('input#default-pressure-pumpValue').val(defaultValues.pressure);
    $('input#default-volume-pumpValue').val(defaultValues.volume);
}

export {
    defaultDefaultValues,
    defaultValues
};
