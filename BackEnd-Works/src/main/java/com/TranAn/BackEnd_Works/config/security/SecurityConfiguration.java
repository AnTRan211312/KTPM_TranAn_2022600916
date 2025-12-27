package com.TranAn.BackEnd_Works.config.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfiguration {

        private static final String[] WHITELIST = {
                        // LOGIN
                        "/auth/login",
                        "/auth/logout",
                        "/auth/register",
                        "/auth/refresh-token",
                        // AUTH - PASSWORD RESET (Public endpoints)
                        "/auth/password/forgot",
                        "/auth/password/verify-otp",
                        "/auth/password/reset",
                        "/auth/password/resend-otp",
                        // "/api/chat-messages",
                        // PUBLIC RESOURCES
                        "/companies/**",
                        "/jobs/**",

                        // API DOCS
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/webjars/**",
                        "/swagger-resources/**",

                        // ACTUATOR
                        "/actuator/**",

                        // PAYMENT CALLBACK
                        "/payments/vnpay-return"

                        // "/favicon.ico",
                        // "/**/*.png",
                        // "/**/*.svg",
                        // "/**/*.jpg",
                        // "/**/*.jpeg",
                        // "/**/*.css",
                        // "/**/*.js",

        };

        @Bean
        public SecurityFilterChain filterChain(
                        HttpSecurity httpSecurity,
                        CustomAuthenticationEntryPoint customAuthenticationEntryPoint) throws Exception {
                httpSecurity
                                .cors(Customizer.withDefaults())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(WHITELIST).permitAll()
                                                .anyRequest().authenticated())
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(Customizer.withDefaults())
                                                .authenticationEntryPoint(customAuthenticationEntryPoint)
                                                .bearerTokenResolver(new SkipPathBearerTokenResolver()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .csrf(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable);

                return httpSecurity.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

}
