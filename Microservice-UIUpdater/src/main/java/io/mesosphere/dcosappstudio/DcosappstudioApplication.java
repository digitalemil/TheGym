package io.mesosphere.dcosappstudio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DcosappstudioApplication {

	public static void main(String[] args) {
		SpringApplication.run(DcosappstudioApplication.class, args);

		
	}

	@Bean
    public Topic topic() {
		System.out.println("Bean creation");
        return new Topic();
	}

}

