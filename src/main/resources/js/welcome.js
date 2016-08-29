function handle(Event) {
    if (Player.getName() == "Mr_jtb") {
        Bukkit.broadcastMessage("&6[&a公告&6] &c热烈欢迎  &aMiaoScript &c作者 &b喵♂呜&c!");
    } else {
        Player.sendMessage("&6[&bMiaoScript&6] &c欢迎来到 &b" + Bukkit.getServerName() + " &c服务器!");
    }
}