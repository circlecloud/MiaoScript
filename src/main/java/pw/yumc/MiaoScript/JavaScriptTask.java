package pw.yumc.MiaoScript;

import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

public class JavaScriptTask implements Delayed {
    private final long id;
    private final Object task;
    private final long startTime;
    private final long executeTime;

    public JavaScriptTask(Object task, long ms) {
        this(0, task, ms);
    }

    public JavaScriptTask(long id, Object task, long ms) {
        this.id = id;
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
        int delay = (int) ((this.startTime + this.executeTime) - (task.getStartTime() + task.getExecuteTime()));
        if (delay != 0) {
            return delay;
        } else {
            return (int) (this.id - task.getId());
        }
    }

    public long getId() {
        return this.id;
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
