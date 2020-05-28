package pw.yumc.MiaoScript;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

import java.io.File;
import javax.annotation.PreDestroy;

@Slf4j
@Component
public class MiaoScriptSpring {
    private ScriptEngine engine;

    @Bean
    @SneakyThrows
    public ScriptEngine buildScriptEngine(ApplicationContext applicationContext) {
        return new ScriptEngine(new File("MiaoScript").getCanonicalPath(), log, applicationContext);
    }

    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }

    @PreDestroy
    public void disableEngine() {
        engine.disableEngine();
        engine = null;
    }
}
