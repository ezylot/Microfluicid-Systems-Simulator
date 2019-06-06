package at.ezylot.fluidsimulator.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.servlet.ModelAndView

@Controller
class MainController {

    @GetMapping("/")
    fun main(): ModelAndView {
        val mav = ModelAndView()
        mav.viewName = "main"
        return mav
    }
}
