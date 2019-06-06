package at.ezylot.fluidsimulator.config

import org.springframework.context.annotation.Bean
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

@EnableWebSecurity
open class WebSecurityConfig : WebSecurityConfigurerAdapter() {

    @Bean
    open fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.inMemoryAuthentication()
            .withUser("microfluidic").password(passwordEncoder().encode("CKwx3y7j")).roles("USER")
    }

    override fun configure(http: HttpSecurity) {
        http.authorizeRequests().antMatchers("/", "/simulate", "/simulateOld").hasRole("USER")
            .and().httpBasic()
            .and().csrf().disable()

    }
}
