export class Droplet {
    public id: number;
    public name: string;
    public volume: number;
    public color: string;


    public constructor(id: number, name: string, volume: number, color: string) {
        this.id = id;
        this.name = name;
        this.volume = volume;
        this.color = color;
    }

    public static cloneTyped(droplet: Droplet): Droplet {
        return new Droplet(
            droplet.id,
            droplet.name,
            droplet.volume,
            droplet.color
        )
    }
}
