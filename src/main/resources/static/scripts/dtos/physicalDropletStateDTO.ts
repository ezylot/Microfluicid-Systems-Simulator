import {DropletPositionDTO} from "./dropletPositionDTO";
import {PhysicalDropletInjectionTimeDTO} from "./physicalDropletInjectionTimeDTO";

export interface PhysicalDropletStateDTO {
    name: string;
    dropletPositions: DropletPositionDTO[];
    dropletInjectionTime: PhysicalDropletInjectionTimeDTO;
}
