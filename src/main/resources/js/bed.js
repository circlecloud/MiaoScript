var msg = Event.getMessage();
var command = msg.substring(1);
switch (command) {
case "setbed":
	Event.setCancelled(true);
	PlayerData.set("bed", Player.getLocation());
	PlayerData.save();
	Player.sendMessage(Prefix + "&a您的床位设置成功 使用&b/gobed &a即可回家!");
	break;
case "gobed":
	Event.setCancelled(true);
	if (PlayerData.isSet("bed")) {
		Player.teleport(PlayerData.getLocation("bed"));
		Player.sendMessage(Prefix + "&a已传送您回床!");
	} else {
		Player.sendMessage(Prefix + "&c请先使用 &b/setbed &c设置您的床位!");
	}
default:
	break;
}