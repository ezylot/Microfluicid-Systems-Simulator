package at.ezylot.fluidsimulator.controller

import at.ezylot.fluidsimulator.dtos.ErrorResponse
import at.ezylot.fluidsimulator.service.SimulatorService
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.slf4j.MarkerFactory
import org.springframework.context.MessageSource
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
class MainApiController(
    private val messageSource: MessageSource,
    private val simulatorService: SimulatorService
) {

    private val LOGGER = LoggerFactory.getLogger(javaClass)
    private val simulationMarker = MarkerFactory.getMarker("simulation")

    @PostMapping("/simulate")
    fun simulate(@RequestBody body: JsonNode): ResponseEntity<*> {
        MDC.put("sourceJSON", body.toString())

        try {
            val errors = validateNodeCounts(body)
            return if (errors.isPresent) {
                LOGGER.error(simulationMarker, "Own caught error occurred: {}", errors.get().message)
                ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errors.get())
            } else {
                return ResponseEntity.ok(simulatorService.simulate(body))
                    .also { LOGGER.info(simulationMarker, "Successful simulation") }
            }
        } catch (e: IllegalArgumentException) {
            LOGGER.error(simulationMarker, "Simulator error occurred: {}", e.message, e)
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(ErrorResponse("error", e.message!!))
        } finally {
            MDC.remove("sourceJSON")
        }
    }

    private fun validateNodeCounts(body: JsonNode): Optional<ErrorResponse> {
        if (body.get("canvas").get("lines").size() == 0) {
            return Optional.of(ErrorResponse("error", messageSource.getMessage("simulation-error.no-channel", arrayOf<String>(), LocaleContextHolder.getLocale())))
        }

        if (body.get("pumps").size() < 2) {
            return Optional.of(ErrorResponse("error", messageSource.getMessage("simulation-error.too-few-pumps", arrayOf<String>(), LocaleContextHolder.getLocale())))
        }

        if (body.get("fluids").size() == 0) {
            return Optional.of(ErrorResponse("error", messageSource.getMessage("simulation-error.no-fluids", arrayOf<String>(), LocaleContextHolder.getLocale())))
        }

        if (body.get("phaseProperties").size() != 4) {
            return Optional.of(ErrorResponse("error", messageSource.getMessage("simulation-error.phase-properties-empty", arrayOf<String>(), LocaleContextHolder.getLocale())))
        }

        if (body.get("droplets").size() == 0) {
            return Optional.of(ErrorResponse("error", messageSource.getMessage("simulation-error.no-droplets", arrayOf<String>(), LocaleContextHolder.getLocale())))
        }

        return if (body.get("dropletInjections").size() == 0) {
            Optional.of(ErrorResponse("error", messageSource.getMessage("simulation-error.no-injections", arrayOf<String>(), LocaleContextHolder.getLocale())))
        } else Optional.empty()

    }
}


