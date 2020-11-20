package pw.yumc.MiaoScript;

import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

public class JavaScriptTask implements Delayed {
    private final Object task;
    private final long startTime;
    private final long executeTime;

    public JavaScriptTask(Object task, long ms) {
        this.task = task;
        this.startTime = System.currentTimeMillis();
        this.executeTime = ms;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert((this.startTime + this.executeTime) - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed delayed) {
        JavaScriptTask task = (JavaScriptTask) delayed;
        return (int) ((this.startTime + this.executeTime) - (task.getStartTime() + task.getExecuteTime()));
    }

    public Object getTask() {
        return this.task;
    }

    public long getStartTime() {
        return this.startTime;
    }

    public long getExecuteTime() {
        return this.executeTime;
    }
}
