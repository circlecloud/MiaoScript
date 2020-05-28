package pw.yumc.MiaoScript.websocket;

import javax.websocket.CloseReason;
import javax.websocket.EndpointConfig;
import javax.websocket.Session;

public interface WebSocketServerProxy {
    void onOpen(Session session, EndpointConfig config);

    void onMessage(Session session, String message);

    void onClose(Session session, CloseReason reason);

    void onError(Session session, Throwable error);
}
