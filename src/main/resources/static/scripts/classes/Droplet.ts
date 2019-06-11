export class Droplet {
    public id: number;
    public name: string;
    public volume: number;


    public constructor(id: number, name: string, volume: number) {
        this.id = id;
        this.name = name;
        this.volume = volume;
    }
}
