function process(Player, Command, Args) {
    var path = "bed.def"
    var bname = "";
    if (Args.length > 0) {
        banem = Args[0];
        path = "bed." + bname;
    }
    var pconfig = PlayerConfig.get(Player.getName());
    switch (Command) {
    case "setbed":
        pconfig.set(path, Player.getLocation());
        pconfig.save();
        Player.sendMessage(Prefix + "&a您的家设置成功 使用&b/gobed " + bname + " &a即可回家!");
        return true;
    case "gobed":
        if (pconfig.isSet(path)) {
            Player.teleport(pconfig.getLocation(path));
            Player.sendMessage(Prefix + "&a已传送您回家!");
        } else {
            Player.sendMessage(Prefix + "&c请先使用 &b/setbed " + bname + " &c设置您的家!");
        }
        return true;
    default:
        return false;
    }
}