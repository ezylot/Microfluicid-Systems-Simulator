package at.ezylot.fluidsimulator

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
open class FluidSimulatorGUIApplication

fun main(args: Array<String>) {
    SpringApplication.run(FluidSimulatorGUIApplication::class.java, *args)
}
