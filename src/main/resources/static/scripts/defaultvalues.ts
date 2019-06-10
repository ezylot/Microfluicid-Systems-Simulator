import * as $ from "jquery";
import ChangeEvent = JQuery.ChangeEvent;

class Defaultvalues {
    public width: number;
    public height: number;
    public pressure: number;
    public volume: number;


    public constructor(width: number, height: number, pressure: number, volume: number) {
        this.width = width;
        this.height = height;
        this.pressure = pressure;
        this.volume = volume;
    }
}

const defaultDefaultValues: Defaultvalues = new Defaultvalues(16, 16, 0, 0);
let defaultValues: Defaultvalues = defaultDefaultValues;

jQuery((): void => {
    $('input#default-width').val(defaultValues.width).on('change', (event: ChangeEvent): void => { defaultValues.width = parseInt(event.target.value); });
    $('input#default-height').val(defaultValues.height).on('change', (event: ChangeEvent): void => { defaultValues.height = parseInt(event.target.value); });
    $('input#default-pressure-pumpValue').val(defaultValues.pressure).on('change', (event: ChangeEvent): void => { defaultValues.pressure = parseInt(event.target.value); });
    $('input#default-volume-pumpValue').val(defaultValues.volume).on('change', (event: ChangeEvent): void => { defaultValues.volume = parseInt(event.target.value); });
});


export function setDefaultValues(newDefaultValues: Defaultvalues): void {
    defaultValues = newDefaultValues;
    $('input#default-width').val(defaultValues.width);
    $('input#default-height').val(defaultValues.height);
    $('input#default-pressure-pumpValue').val(defaultValues.pressure);
    $('input#default-volume-pumpValue').val(defaultValues.volume);
}

export {
    defaultDefaultValues,
    defaultValues
};

//TODO: remove after converting
// @ts-ignore
window.defaultValues = defaultValues;
// @ts-ignore
window.setDefaultValues = setDefaultValues;
