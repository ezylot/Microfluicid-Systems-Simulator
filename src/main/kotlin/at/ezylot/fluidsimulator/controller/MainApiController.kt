package at.ezylot.fluidsimulator.controller

import at.ezylot.fluidsimulator.dtos.ErrorResponse
import at.ezylot.fluidsimulator.service.SimulatorService
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.context.MessageSource
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
class MainApiController(private val messageSource: MessageSource, private val simulatorService: SimulatorService) {

    @PostMapping("/simulate")
    fun simulate(@RequestBody body: JsonNode): ResponseEntity<*> {
        val errors = validateNodeCounts(body)
        return if (errors.isPresent) {
            ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errors.get())
        } else {
            try {
                ResponseEntity.ok(simulatorService.simulate(body))
            } catch (e: IllegalArgumentException) {
                ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(ErrorResponse("error", e.message!!))
            }
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


