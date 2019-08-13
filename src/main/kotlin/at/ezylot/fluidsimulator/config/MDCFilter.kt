package at.ezylot.fluidsimulator.config

import org.apache.commons.lang3.BooleanUtils
import org.apache.commons.lang3.time.StopWatch
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.slf4j.MarkerFactory
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class MDCFilter: OncePerRequestFilter() {
    private val requestMarker = MarkerFactory.getMarker("request")
    private val mdcLogger = LoggerFactory.getLogger(javaClass)

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val queryString = request.queryString
        val uri = request.requestURL.toString() + if(queryString.orEmpty().isEmpty()) "" else "?$queryString"
        val path = request.requestURI.toString() + if(queryString.orEmpty().isEmpty()) "" else "?$queryString"

        MDC.put("REQUEST.ID", UUID.randomUUID().toString())
        MDC.put("REQUEST.ADDRESS", request.remoteAddr)
        MDC.put("REQUEST.REALIP", request.getHeader("X-Real-IP"))
        MDC.put("REQUEST.FORWAREDFOR", request.getHeader("X-Forwarded-For"))
        MDC.put("REQUEST.URI", uri)
        MDC.put("REQUEST.PATH", path)
        MDC.put("REQUEST.AJAX", BooleanUtils.toStringTrueFalse("XMLHttpRequest".equals(request.getHeader("X-Requested-With"), ignoreCase = true)))

        val stopWatch = StopWatch.createStarted()
        filterChain.doFilter(request, response)
        stopWatch.stop()

        if(request.requestURI.endsWith("js")
            || request.requestURI.endsWith("css")
            || request.requestURI.endsWith("png")) {
            return
        }

        MDC.put("RESPONSE.DURATION", stopWatch.time.toString())
        MDC.put("RESPONSE.STATUS", response.status.toString())
        mdcLogger.info(requestMarker, "Executed call to {} in {} ms", uri, stopWatch.time)
    }
}
