export class Fluid {
    public id: number;
    public name: string;
    public mu: number;
    public densityC: number;

    public constructor(id: number, name: string, mu: number, densityC: number) {
        this.id = id;
        this.name = name;
        this.mu = mu;
        this.densityC = densityC;
    }

    public static cloneTyped(fluid: Fluid): Fluid {
        return new Fluid(
            fluid.id,
            fluid.name,
            fluid.mu,
            fluid.densityC
        )
    }
}
