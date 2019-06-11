import * as $ from "jquery";
import ChangeEvent = JQuery.ChangeEvent;
import {DefaultValues} from "./classes/DefaultValues";


const defaultDefaultValues: DefaultValues = new DefaultValues(16, 16, 0, 0);
const defaultvalueManager: DefaultValues = defaultDefaultValues;

jQuery((): void => {
    $('input#default-width').val(defaultvalueManager.width).on('change', (event: ChangeEvent): void => { defaultvalueManager.width = parseInt(event.target.value); });
    $('input#default-height').val(defaultvalueManager.height).on('change', (event: ChangeEvent): void => { defaultvalueManager.height = parseInt(event.target.value); });
    $('input#default-pressure-pumpValue').val(defaultvalueManager.pressure).on('change', (event: ChangeEvent): void => { defaultvalueManager.pressure = parseInt(event.target.value); });
    $('input#default-volume-pumpValue').val(defaultvalueManager.volume).on('change', (event: ChangeEvent): void => { defaultvalueManager.volume = parseInt(event.target.value); });
});


export function setDefaultValues(newDefaultValues: DefaultValues): void {
    defaultvalueManager.width = newDefaultValues._width;
    defaultvalueManager.height = newDefaultValues._height;
    defaultvalueManager.pressure = newDefaultValues._pressure;
    defaultvalueManager.volume = newDefaultValues._volume;

    $('input#default-width').val(defaultvalueManager.width);
    $('input#default-height').val(defaultvalueManager.height);
    $('input#default-pressure-pumpValue').val(defaultvalueManager.pressure);
    $('input#default-volume-pumpValue').val(defaultvalueManager.volume);
}

export {
    defaultDefaultValues,
    defaultvalueManager
};

//TODO: remove after converting
// @ts-ignore
window.defaultValues = defaultvalueManager;
// @ts-ignore
window.setDefaultValues = setDefaultValues;
