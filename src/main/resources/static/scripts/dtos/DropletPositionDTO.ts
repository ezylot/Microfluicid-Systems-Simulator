export interface DropletPositionDTO {
    edgeName: string;
    defaultFlowDirection: boolean;
    dropletVolume: number;

    edge: { x1: number; x2: number; y1: number; y2: number };
    headPosition: number;
    tailPosition: number;
}
