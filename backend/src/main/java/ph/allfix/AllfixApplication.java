package ph.allfix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AllfixApplication {
    public static void main(String[] args) {
        SpringApplication.run(AllfixApplication.class, args);
    }
}
