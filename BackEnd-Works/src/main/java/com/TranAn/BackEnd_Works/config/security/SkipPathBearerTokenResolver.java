package com.TranAn.BackEnd_Works.config.security;


import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;

import java.util.List;

public class SkipPathBearerTokenResolver implements BearerTokenResolver {

    private final BearerTokenResolver delegate = new DefaultBearerTokenResolver();

    private final List<String> skipPaths = List.of(
            "/auth/logout",
            "/auth/register");

    @Override
    public String resolve(HttpServletRequest request) {
        String path = request.getRequestURI();

        for (String skip : skipPaths) {
            if (path.contains(skip)) {
                return null;
            }
        }

        return delegate.resolve(request);
    }
}