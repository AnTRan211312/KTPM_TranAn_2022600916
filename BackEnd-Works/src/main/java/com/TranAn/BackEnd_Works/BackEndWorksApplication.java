package com.TranAn.BackEnd_Works;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching

public class BackEndWorksApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackEndWorksApplication.class, args);
    }

}
