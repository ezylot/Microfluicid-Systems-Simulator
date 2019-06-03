package at.ezylot.fluidsimulator.dtos;

import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionTime;
import at.jku.iic.droplet.electric.simulator.state.*;

import java.util.List;
import java.util.stream.Collectors;

public class ReturnDTO {
    private final double time;
    private final List<PhysicalDropletStateDTO> dropletStates;

    public ReturnDTO(PhysicalSystemState state) {
        this.time = state.time;
        this.dropletStates = state.getDropletStates().stream()
            .map(PhysicalDropletStateDTO::new)
            .collect(Collectors.toList());
    }

    public double getTime() {
        return time;
    }

    public List<PhysicalDropletStateDTO> getDropletStates() {
        return dropletStates;
    }


    public static class PhysicalDropletStateDTO {
        private final List<DropletPositionDTO> dropletPositions;
        private final PhysicalDropletInjectionTimeDTO dropletInjectionTime;


        PhysicalDropletStateDTO(PhysicalDropletState state) {
            this.dropletPositions = state.getDropletPositions().stream().map(DropletPositionDTO::new).collect(Collectors.toList());
            this.dropletInjectionTime = new PhysicalDropletInjectionTimeDTO(state.getDropletInjectionTime());
        }

        public List<DropletPositionDTO> getDropletPositions() {
            return dropletPositions;
        }

        public PhysicalDropletInjectionTimeDTO getDropletInjectionTime() {
            return dropletInjectionTime;
        }
    }

    public static class DropletPositionDTO {
        private final String edgeName;
        private LineCoords edge;
        private final boolean defaultFlowDirection;
        private final Double dropletVolume;
        private final Double headPosition;
        private final Double tailPosition;

        DropletPositionDTO(DropletPosition dropletPosition) {
            this.edgeName = dropletPosition.edge.name;
            this.defaultFlowDirection = dropletPosition.defaultFlowDirection;
            this.dropletVolume = dropletPosition.dropletVolume;

            if(dropletPosition instanceof DropletHeadPosition) {
                this.headPosition = ((DropletHeadPosition) dropletPosition).headPosition / dropletPosition.edge.getLength();
                this.tailPosition = null;
            } else if(dropletPosition instanceof DropletTailPosition) {
                this.headPosition = null;
                this.tailPosition = ((DropletTailPosition) dropletPosition).tailPosition / dropletPosition.edge.getLength();
            } else if(dropletPosition instanceof DropletRangePosition) {
                this.headPosition = ((DropletRangePosition) dropletPosition).furthestPosition / dropletPosition.edge.getLength();
                this.tailPosition = ((DropletRangePosition) dropletPosition).nearestPosition / dropletPosition.edge.getLength();
            } else {
                this.headPosition = null;
                this.tailPosition = null;
            }
        }

        public boolean isDefaultFlowDirection() {
            return defaultFlowDirection;
        }

        public Double getDropletVolume() {
            return dropletVolume;
        }

        public Double getHeadPosition() {
            return headPosition;
        }

        public Double getTailPosition() {
            return tailPosition;
        }

        public String getEdgeName() {
            return edgeName;
        }

        public LineCoords getEdge() {
            return edge;
        }

        public void setEdge(LineCoords edge) {
            this.edge = edge;
        }
    }

    public static class PhysicalDropletInjectionTimeDTO {
        private final double dropletVolume;
        private final double timePoint;
        private final String pumpName;

        PhysicalDropletInjectionTimeDTO(PhysicalDropletInjectionTime dropletInjectionTime) {
            this.dropletVolume = dropletInjectionTime.dropletVolume;
            this.timePoint = dropletInjectionTime.timePoint;
            this.pumpName = dropletInjectionTime.pump.name;
        }

        public double getDropletVolume() {
            return dropletVolume;
        }

        public double getTimePoint() {
            return timePoint;
        }

        public String getPumpName() {
            return pumpName;
        }
    }
}
