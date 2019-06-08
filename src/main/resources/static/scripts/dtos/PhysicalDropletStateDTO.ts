import {DropletPositionDTO} from "./DropletPositionDTO";
import {PhysicalDropletInjectionTimeDTO} from "./PhysicalDropletInjectionTimeDTO";

export interface PhysicalDropletStateDTO {
    name: string;
    dropletPositions: DropletPositionDTO[];
    dropletInjectionTime: PhysicalDropletInjectionTimeDTO;
}
