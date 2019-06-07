package at.ezylot.fluidsimulator.service

import at.ezylot.fluidsimulator.dtos.ReturnDTO
import com.fasterxml.jackson.databind.JsonNode

interface SimulatorService {
    fun simulate(root: JsonNode): List<ReturnDTO>
}
