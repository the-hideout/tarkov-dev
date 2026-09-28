export const CATEGORIES = {
    MAPS: "Maps",
    DATABASE: "Database",
    CALCULATORS: "Calculators",
    PROGRESSION: "Progression",
    COMMUNITY: "Community",
};

// Faction troops (not named bosses from https://escapefromtarkov.fandom.com/wiki/Category:Bosses),
// ordered by faction as in https://escapefromtarkov.fandom.com/wiki/Factions.
// bear/usec only spawn as boss-type mobs in PVE, black-div-season only in PVP Season.
const FACTION_NORMALIZED_NAMES = [
    "bear",
    "usec",
    "raider",
    "rogue",
    "exusecfree",
    "cultist-priest",
    "af",
    "black-div",
    "black-div-boss",
    "black-div-raider",
    "black-div-season",
];

export const getMenuData = (t, { traders, bosses, uniqueMaps, categoryPages }) => [
    {
        id: "maps",
        text: t("Maps"),
        to: "/maps/",
        items: uniqueMaps.map((map) => ({
            text: map.name,
            to: `/map/${map.key}`,
            icon: map.icon,
            padding: map.menuPadding,
        })),
    },
    {
        id: "items",
        text: t("Items"),
        to: "/items/",
        items: [
            {
                text: t("Gear"),
                items: categoryPages
                    .filter((cp) => ["headsets", "helmets", "glasses", "armors", "rigs", "backpacks"].includes(cp.key))
                    .map((cp) => ({
                        text: t(cp.displayText),
                        to: `/items/${cp.key}`,
                    })),
            },
            {
                text: t("Weaponry"),
                items: [
                    { text: t("Ammo"), to: "/ammo/" },
                    ...categoryPages
                        .filter((cp) => ["guns", "mods", "pistol-grips", "suppressors"].includes(cp.key))
                        .map((cp) => ({
                            text: t(cp.displayText),
                            to: `/items/${cp.key}`,
                        })),
                ],
            },
            {
                text: t("Equipment & Tools"),
                items: categoryPages
                    .filter((cp) => ["grenades", "containers", "barter-items", "keys", "provisions"].includes(cp.key))
                    .map((cp) => ({
                        text: t(cp.displayText),
                        to: `/items/${cp.key}`,
                    })),
            },
        ],
    },
    {
        id: "traders",
        text: t("Traders"),
        to: "/traders",
        items: traders.map((trader) => ({
            text: trader.name,
            to: `/trader/${trader.normalizedName}`,
        })),
    },
    {
        id: "bosses",
        text: t("Bosses"),
        to: "/bosses/",
        items: [
            {
                text: t("Main Bosses"),
                items: bosses
                    .filter((boss) => boss.maps.length > 0 && !FACTION_NORMALIZED_NAMES.includes(boss.normalizedName))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((boss) => ({
                        text: boss.name,
                        to: `/boss/${boss.normalizedName}`,
                    })),
            },
            {
                text: t("Factions"),
                items: bosses
                    .filter((boss) => boss.maps.length > 0 && FACTION_NORMALIZED_NAMES.includes(boss.normalizedName))
                    .sort(
                        (a, b) =>
                            FACTION_NORMALIZED_NAMES.indexOf(a.normalizedName) -
                            FACTION_NORMALIZED_NAMES.indexOf(b.normalizedName),
                    )
                    .map((boss) => ({
                        text: boss.name,
                        to: `/boss/${boss.normalizedName}`,
                    })),
            },
        ],
    },
    {
        id: "calculators",
        text: t("Calculators"),
        items: [
            { text: t("Barter profit"), to: "/barters/" },
            { text: t("Hideout profit"), to: "/hideout-profit/" },
            { text: t("Hideout build costs"), to: "/hideout" },
            { text: t("Bitcoin Farm Profit"), to: "/bitcoin-farm-calculator" },
            { text: t("Currency Converter"), to: "/converter" },
        ],
    },
    {
        id: "progression",
        text: t("Progression"),
        items: [
            { text: t("Tasks"), to: "/tasks" },
            { text: t("Loot tiers"), to: "/loot-tier/" },
            { text: t("Wipe length"), to: "/wipe-length" },
            { text: t("Achievements"), to: "/achievements" },
            { text: t("Prestige"), to: "/prestige" },
            { text: t("Players"), to: "/players" },
        ],
    },
    {
        id: "community",
        text: t("Community"),
        items: [
            { text: t("TarkovMonitor"), to: "/tarkov-monitor" },
            { text: t("Stash Discord Bot"), to: "/stash-discord-bot" },
            { text: t("API"), to: "/api/" },
        ],
    },
];
