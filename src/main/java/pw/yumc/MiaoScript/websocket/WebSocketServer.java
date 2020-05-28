package pw.yumc.MiaoScript.websocket;

import lombok.SneakyThrows;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;

@Component
@ServerEndpoint("/ws/")
public class WebSocketServer implements ApplicationContextAware {
    private static ApplicationContext context;
    private WebSocketServerProxy proxy;

    private boolean checkProxy(Session session) {
        try {
            if (this.proxy == null) {
                this.proxy = context.getBean(WebSocketServerProxy.class);
            }
            return true;
        } catch (Exception ex) {
            try {
                session.close();
            } catch (Exception ignore) {
            }
            return false;
        }
    }

    @OnOpen
    @SneakyThrows
    public void onOpen(Session session, EndpointConfig config) {
        if (this.checkProxy(session)) {
            this.proxy.onOpen(session, config);
        }
    }

    @OnMessage
    @SneakyThrows
    public void onMessage(Session session, String message) {
        if (this.checkProxy(session)) {
            this.proxy.onMessage(session, message);
        }
    }

    @OnClose
    @SneakyThrows
    public void onClose(Session session, CloseReason reason) {
        if (this.checkProxy(session)) {
            this.proxy.onClose(session, reason);
        }
    }

    @OnError
    @SneakyThrows
    public void onError(Session session, Throwable error) {
        if (this.checkProxy(session)) {
            this.proxy.onError(session, error);
        }
    }

    @Override
    public void setApplicationContext(ApplicationContext ctx) throws BeansException {
        context = ctx;
    }
}
