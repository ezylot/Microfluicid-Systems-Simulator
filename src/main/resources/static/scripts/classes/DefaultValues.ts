export class DefaultValues {
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
