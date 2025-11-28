package com.TranAn.BackEnd_Works.config.network;

import com.TranAn.BackEnd_Works.model.ChatMessage;
import com.TranAn.BackEnd_Works.model.SessionMeta;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.List;


@Configuration
public class RedisConfig {



    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration serverConfig =
                new RedisStandaloneConfiguration(redisHost, redisPort);

        if (redisPassword != null &&!redisPassword.isBlank()) {
            serverConfig.setPassword(RedisPassword.of(redisPassword));
        }

        return new LettuceConnectionFactory(serverConfig);
    }


//    @Value("${spring.data.redis.cluster.nodes}")
//    private String redisEndpoint;
//
//    @Bean
//    public RedisConnectionFactory redisConnectionFactory() {
//        String endpoint = redisEndpoint.trim();
//        // Xóa các tiền tố protocol không cần thiết
//        if (endpoint.startsWith("tls://")) {
//            endpoint = endpoint.substring(6);
//        } else if (endpoint.startsWith("redis://")) {
//            endpoint = endpoint.substring(8);
//        }
//
//        // Tạo cấu hình cluster từ endpoint
//        // Lưu ý: ElastiCache Serverless endpoint không chứa port.
//        // ElastiCache Cluster Mode endpoint chứa port, thường là 6379.
//        RedisClusterConfiguration clusterConfig =
//                new RedisClusterConfiguration(List.of(endpoint));
//
//        // Cấu hình client cơ bản nhất
//        // Chúng ta vẫn cần bật SSL/TLS nếu ElastiCache yêu cầu
//        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
//                .useSsl() // Giữ lại nếu ElastiCache của bạn bật In-Transit Encryption (SSL/TLS)
//                .build();
//
//        // Tạo connection factory
//        return new LettuceConnectionFactory(clusterConfig, clientConfig);
//    }

    // =====================================================================
    // 2. RedisTemplate cho SessionMeta (Authentication sessions)
    // =====================================================================
    @Bean
    public RedisTemplate<String, SessionMeta> redisSessionMetaTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, SessionMeta> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // KEY
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // VALUE
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        Jackson2JsonRedisSerializer<SessionMeta> valueSerializer =
                new Jackson2JsonRedisSerializer<>(objectMapper, SessionMeta.class);

        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);

        return template;
    }

    // =====================================================================
    // 3. RedisTemplate cho OTP (String-String)
    // =====================================================================
    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // KEY và VALUE đều dùng StringRedisSerializer
        StringRedisSerializer serializer = new StringRedisSerializer();
        template.setKeySerializer(serializer);
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(serializer);
        template.setHashValueSerializer(serializer);

        return template;
    }

    // =====================================================================
    // 4. RedisTemplate cho Chat History (List<ChatMessage>)
    //    - Lưu lịch sử chat của user với AI
    //    - Key: chat::history:userId:sessionId
    //    - Value: List<ChatMessage>
    // =====================================================================
    @Bean
    public RedisTemplate<String, List<ChatMessage>> redisChatTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, List<ChatMessage>> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // KEY
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // VALUE - Serialize List<ChatMessage> thành JSON
        // Sử dụng GenericJackson2JsonRedisSerializer để giữ được generic type
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        // Disable tính năng tự động phát hiện properties để tránh serialize lazy loaded entities
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);

        return template;
    }


    // =====================================================================
    // 5. Cấu hình Spring Cache với Redis
    //    - Thiết lập thời gian sống mặc định cho cache (TTL)
    //    - Chỉ áp dụng cho các cache dùng annotation (@Cacheable, @CacheEvict...)
    // =====================================================================
    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(15))
                .disableCachingNullValues();
    }

    // =====================================================================
    // 6. Khởi tạo CacheManager sử dụng Redis
    //    - Quản lý cache thông qua Spring Cache (annotation)
    //    - Tự động áp dụng các cấu hình phía trên cho toàn bộ cache
    // =====================================================================
    @Bean
    public RedisCacheManager cacheManager(
            RedisConnectionFactory factory,
            RedisCacheConfiguration cacheConfiguration) {
        return RedisCacheManager.builder(factory)
                .cacheDefaults(cacheConfiguration)
                .transactionAware()
                .build();
    }
}