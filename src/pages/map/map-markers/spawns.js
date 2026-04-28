import L from "leaflet";

// Build all spawn-related layers (PMC, scav, bosses) with renderer parity.
// This module owns spawn type classification and popup content composition.
export function buildSpawnMarkers({
    mapData,
    categories,
    useCanvasMassRenderer,
    canvasRenderer,
    positionIsInBounds,
    createMapMarker,
    getReactLink,
    addElevation,
    finalizeMarker,
    checkMarkerBounds,
    addLayer,
}) {
    if (mapData.spawns.length === 0) {
        return;
    }

    const spawnLayers = {
        "pmc": L.layerGroup(),
        "scav": L.layerGroup(),
        "sniper_scav": L.layerGroup(),
        "boss": L.layerGroup(),
        "cultist-priest": L.layerGroup(),
        "rogue": L.layerGroup(),
        "black-div": L.layerGroup(),
        "af": L.layerGroup(),
        "bloodhound": L.layerGroup(),
    };
    const useCanvasForSpawns = useCanvasMassRenderer;

    for (const spawn of mapData.spawns) {
        if (!positionIsInBounds(spawn.position)) {
            continue;
        }

        let spawnType = "";
        let bosses = [];
        let markerClass;

        // Keep legacy boss classification rules to avoid changing visible marker groups.
        if (spawn.categories.includes("boss")) {
            bosses = mapData.bosses.filter((boss) => boss.spawnLocations.some((sl) => sl.spawnKey === spawn.zoneName));
            bosses = bosses.reduce((unique, current) => {
                if (!unique.some((b) => b.normalizedName === current.normalizedName)) {
                    unique.push(current);
                }
                return unique;
            }, []);

            if (bosses.length === 0) {
                if (spawn.categories.includes("bot") && spawn.sides.includes("scav")) {
                    spawnType = "scav";
                } else {
                    continue;
                }
            } else if (
                bosses.length === 1 &&
                (bosses[0].normalizedName === "cultist-priest" ||
                    bosses[0].normalizedName === "rogue" ||
                    bosses[0].normalizedName === "black-div" ||
                    bosses[0].normalizedName === "af" ||
                    bosses[0].normalizedName === "bloodhound")
            ) {
                spawnType = bosses[0].normalizedName;
            } else {
                spawnType = "boss";
            }
        } else if (spawn.categories.includes("player")) {
            if (spawn.sides.includes("pmc") || spawn.sides.includes("all")) {
                spawnType = "pmc";
            } else {
                continue;
            }
        } else if (spawn.categories.includes("sniper")) {
            spawnType = "sniper_scav";
            markerClass = "sniper-spawn";
        } else if (spawn.sides.includes("scav")) {
            if (spawn.categories.includes("bot") || spawn.categories.includes("all")) {
                spawnType = "scav";
            } else {
                continue;
            }
        } else {
            continue;
        }

        const popupContent = L.DomUtil.create("div");
        if (spawn.categories.includes("boss") && bosses.length > 0) {
            const bossList = L.DomUtil.create("div", undefined, popupContent);
            for (const boss of bosses) {
                if (!categories[`spawn_${boss.normalizedName}`]) {
                    categories[`spawn_${boss.normalizedName}`] = boss.name;
                }
                if (bossList.childNodes.length > 0) {
                    const comma = L.DomUtil.create("span", undefined, bossList);
                    comma.textContent = ", ";
                }
                bossList.append(
                    getReactLink(
                        `/boss/${boss.normalizedName}`,
                        `${boss.name} (${Math.round(boss.spawnChance * 100)}%)`,
                    ),
                );
            }
        } else {
            const spawnDiv = L.DomUtil.create("div", undefined, popupContent);
            spawnDiv.textContent = categories[`spawn_${spawnType}`];
        }
        addElevation(spawn, popupContent);

        const spawnIconOptions = {
            iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/spawn_${spawnType}.png`,
            iconSize: [24, 24],
            popupAnchor: [0, -12],
            className: markerClass,
        };
        if (spawnType === "pmc") {
            spawnIconOptions.iconAnchor = [12, 24];
            spawnIconOptions.popupAnchor = [0, -24];
        }

        // createMapMarker keeps canvas/dom behavior in sync.
        const marker = createMapMarker({
            useCanvas: useCanvasForSpawns,
            position: spawn.position,
            canvasOptions: {
                renderer: canvasRenderer,
                iconUrl: spawnIconOptions.iconUrl,
                iconSize: [24, 24],
                hitRadius: spawnType === "pmc" ? 9 : 8,
                className: markerClass,
            },
            domIconOptions: spawnIconOptions,
        });

        marker.position = spawn.position;
        const markerPopupContent = popupContent.childNodes.length > 0 ? popupContent : null;
        finalizeMarker(marker, { popupContent: markerPopupContent });
        marker.addTo(spawnLayers[spawnType]);
        checkMarkerBounds(spawn.position);
    }

    for (const key in spawnLayers) {
        if (Object.keys(spawnLayers[key]._layers).length > 0) {
            addLayer(spawnLayers[key], `spawn_${key}`, "Spawns");
        }
    }
}
