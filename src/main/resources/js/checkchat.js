var dirs = Data.getStringList("dirChat");
var msg = Event.getMessage();
for (i in dirs) {
	if (msg.contains(dirs[i])) {
		Event.setCancelled(true);
		Player.sendMessage("&6[&b警告&6] &c请不要讲脏话!");
	}
}