package pw.yumc.MiaoScript.web;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface WebServerProxy {
    Object process(HttpServletRequest req, HttpServletResponse resp);
}
