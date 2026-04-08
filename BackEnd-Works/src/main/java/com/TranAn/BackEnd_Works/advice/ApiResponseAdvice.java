package com.TranAn.BackEnd_Works.advice;

import com.TranAn.BackEnd_Works.annotation.ApiMessage;
import com.TranAn.BackEnd_Works.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.Arrays;
import java.util.List;

@RestControllerAdvice
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {
    private static final List<String> EXCLUDE_PATTERNS = Arrays.asList(
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**",
            "/favicon.ico",
            "/actuator/**",
            "/error",
            "/doc.html"

    );
    private static final AntPathMatcher antPathMatcher = new AntPathMatcher();

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            String path = attributes.getRequest().getRequestURI();
            for (String pattern : EXCLUDE_PATTERNS) {
                if (antPathMatcher.match(pattern, path)) {
                    return false;
                }
            }
        }
        Class<?> returnTypeClass = returnType.getParameterType();
        return returnTypeClass != byte[].class
                && !org.springframework.core.io.Resource.class.isAssignableFrom(returnTypeClass)
                && !org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody.class
                        .isAssignableFrom(returnTypeClass)
                && !returnTypeClass.getName().startsWith("reactor.core.publisher.")
                && !org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.class
                        .isAssignableFrom(returnTypeClass);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request,
            ServerHttpResponse response) {
        HttpServletResponse servletResponse = ((ServletServerHttpResponse) response).getServletResponse();
        int status = servletResponse.getStatus();

        // If body is already ApiResponse or String, return as is
        if (body instanceof ApiResponse<?> || body instanceof String) {
            return body;
        }

        // Special handling for StringHttpMessageConverter to avoid ClassCastException
        if (selectedConverterType.getName().contains("StringHttpMessageConverter")) {
            // StringHttpMessageConverter expects a String. If we return ApiResponse here,
            // it will crash.
            // Since line 58 already returned if body was a String, if we are here, body is
            // likely null or another object.
            // In these cases, we should not wrap into ApiResponse if the converter can only
            // handle Strings.
            return body;
        }

        ApiMessage apiMessage = returnType.getMethodAnnotation(ApiMessage.class);
        if (status >= 400) {
            return new ApiResponse<>(
                    apiMessage == null ? "Fail" : apiMessage.value(),
                    status);
        }
        return new ApiResponse<>(
                apiMessage == null ? "Success" : apiMessage.value(),
                body);
    }
}
