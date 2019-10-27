package at.ezylot.fluidsimulator.service

import at.ezylot.fluidsimulator.dtos.ReturnDTO
import com.fasterxml.jackson.databind.JsonNode
import java.util.concurrent.Future

interface SimulatorService {
    fun simulate(root: JsonNode): Pair<Thread, Future<List<ReturnDTO>>>
}
