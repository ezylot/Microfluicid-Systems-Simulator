package at.ezylot.fluidsimulator;

import at.ezylot.fluidsimulator.config.TestBase;
import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class MainIntegrationTest extends TestBase {

    @LocalServerPort
    protected int port;

    @Test
    public void checkTitleIsCorrect() {
        WebDriver webDriver = getDriver();
        webDriver.navigate().to("http://host.docker.internal:" + this.port);
        Assert.assertEquals("Microfluidic Systems Simulator", webDriver.getTitle());
    }
}
