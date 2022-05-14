package pw.yumc.MiaoScript;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;
import pw.yumc.MiaoScript.api.ScriptEngine;

import java.io.File;

@Slf4j
@Component
public class MiaoScriptSpring {
    @Bean
    @SneakyThrows
    public ScriptEngine buildScriptEngine(ApplicationContext applicationContext) {
        return new ScriptEngine(new File("MiaoScript").getCanonicalPath(), log, applicationContext);
    }

    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
