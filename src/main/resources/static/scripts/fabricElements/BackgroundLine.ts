import {ILineOptions, Line} from "fabric/fabric-impl";

export class BackgroundLine extends Line {
    public represents = 'backgroundLine';

    public constructor(points: number[], objObjects: ILineOptions, represents: string) {
        super(points, objObjects);
        this.represents = represents;
    }
}
