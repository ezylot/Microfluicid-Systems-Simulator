import * as $ from "jquery";
import ChangeEvent = JQuery.ChangeEvent;

class Defaultvalues {
    public _width: number;
    public _height: number;
    public _pressure: number;
    public _volume: number;

    public constructor(width: number, height: number, pressure: number, volume: number) {
        this._width = width;
        this._height = height;
        this._pressure = pressure;
        this._volume = volume;
    }


    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        this._width = value;
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        this._height = value;
    }

    public get pressure(): number {
        return this._pressure;
    }

    public set pressure(value: number) {
        this._pressure = value;
    }

    public get volume(): number {
        return this._volume;
    }

    public set volume(value: number) {
        this._volume = value;
    }
}

const defaultDefaultValues: Defaultvalues = new Defaultvalues(16, 16, 0, 0);
const defaultValues: Defaultvalues = defaultDefaultValues;

jQuery((): void => {
    $('input#default-width').val(defaultValues.width).on('change', (event: ChangeEvent): void => { defaultValues.width = parseInt(event.target.value); });
    $('input#default-height').val(defaultValues.height).on('change', (event: ChangeEvent): void => { defaultValues.height = parseInt(event.target.value); });
    $('input#default-pressure-pumpValue').val(defaultValues.pressure).on('change', (event: ChangeEvent): void => { defaultValues.pressure = parseInt(event.target.value); });
    $('input#default-volume-pumpValue').val(defaultValues.volume).on('change', (event: ChangeEvent): void => { defaultValues.volume = parseInt(event.target.value); });
});


export function setDefaultValues(newDefaultValues: Defaultvalues): void {
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

//TODO: remove after converting
// @ts-ignore
window.defaultValues = defaultValues;
// @ts-ignore
window.setDefaultValues = setDefaultValues;
