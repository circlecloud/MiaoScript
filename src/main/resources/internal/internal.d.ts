interface Class {
    name;
    class;
    static;
    methods;
    simpleName;
    constructors;
    parameterTypes;
}

interface Task {
    submit(plugin);
}

interface Registration {
    provider;
}

interface PluginManager {
    isEnabled();
}

interface bukkit {
    nmsVersion: string;
}

interface Server {
    server;
    service;
    consoleSender;
    onlinePlayers;
    pluginManager;
    serviceManager;
    servicesManager;
    onlinePlayers;
}

interface Player {
    handle: NMSPlayer;

    getName();

    openInventory();
}

interface Inventory {
    setItem(index: number, item: Item);
}

interface PlayerEvent {
    targetEntity;
}

interface ItemEvent {
    entity: Item;
}

interface InventoryClickEvent {
    inventory;
    whoClicked;
    rawSlot;
}

interface NMSPlayer {
    playerConnection;
}

interface File {
    canonicalPath;

    isDirectory();
}

interface Item {
    itemStack: ItemStack;
}

interface ItemStack {
    typeId;
    itemMeta;
    amount;
}