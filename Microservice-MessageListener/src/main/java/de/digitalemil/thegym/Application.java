package de.digitalemil.thegym;

import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@SpringBootApplication
@Configuration
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
		Map<String, String> env = System.getenv();
        if("true".equals(env.get("NONSECURE"))) {
			System.clearProperty("spring.kafka.properties.sasl.mechanism");
			System.clearProperty("spring.kafka.properties.security.protocol");
		}
	
		
	}
}

