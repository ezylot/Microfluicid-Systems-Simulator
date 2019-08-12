package at.ezylot.fluidsimulator.dtos

import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionTime
import at.jku.iic.droplet.electric.simulator.state.*
import java.util.stream.Collectors

class ReturnDTO(state: PhysicalSystemState) {
    val time: Double = state.time
    val dropletStates: List<PhysicalDropletStateDTO> = state.dropletStates.stream()
        .map { PhysicalDropletStateDTO(it) }
        .collect(Collectors.toList())

    class PhysicalDropletStateDTO internal constructor(state: PhysicalDropletState) {
        val name: String = state.name
        val dropletPositions: List<DropletPositionDTO> = state.dropletPositions.stream()
            .map { DropletPositionDTO(it) }
            .collect(Collectors.toList())
        val dropletInjectionTime: PhysicalDropletInjectionTimeDTO = PhysicalDropletInjectionTimeDTO(state.dropletInjectionTime)

        override fun toString(): String {
            return "PhysicalDropletStateDTO(name='$name', dropletPositions=$dropletPositions, dropletInjectionTime=$dropletInjectionTime)"
        }
    }

    class DropletPositionDTO internal constructor(dropletPosition: DropletPosition) {
        val edgeName: String = dropletPosition.edge.name
        val defaultFlowDirection: Boolean = dropletPosition.defaultFlowDirection
        val dropletVolume: Double = dropletPosition.dropletVolume

        var edge: LineCoords? = null
        val headPosition: Double?
        val tailPosition: Double?

        init {
            if (dropletPosition is DropletHeadPosition) {
                this.headPosition = dropletPosition.headPosition / dropletPosition.edge.length
                this.tailPosition = 0.0
            } else if (dropletPosition is DropletTailPosition) {
                this.headPosition = 1.0
                this.tailPosition = dropletPosition.tailPosition / dropletPosition.edge.length
            } else if (dropletPosition is DropletRangePosition) {
                this.headPosition = dropletPosition.furthestPosition / dropletPosition.edge.length
                this.tailPosition = dropletPosition.nearestPosition / dropletPosition.edge.length
            } else if (dropletPosition is DropletInjectionPosition) {
                this.headPosition = 0.0
                this.tailPosition = 0.0
            } else {
                this.headPosition = null
                this.tailPosition = null
            }
        }

        override fun toString(): String {
            return "DropletPositionDTO(edgeName='$edgeName', defaultFlowDirection=$defaultFlowDirection, dropletVolume=$dropletVolume, edge=$edge, headPosition=$headPosition, tailPosition=$tailPosition)"
        }


    }

    class PhysicalDropletInjectionTimeDTO internal constructor(dropletInjectionTime: PhysicalDropletInjectionTime) {
        val dropletVolume: Double
        val timePoint: Double
        val pumpName: String

        init {
            this.dropletVolume = dropletInjectionTime.dropletVolume
            this.timePoint = dropletInjectionTime.timePoint
            this.pumpName = dropletInjectionTime.pump.name
        }
    }

    override fun toString(): String {
        return "ReturnDTO(time=$time, dropletStates=$dropletStates)"
    }


}
