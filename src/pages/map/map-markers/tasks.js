import L from "leaflet";

// Build quest item and objective markers.
// Returns questSet so caller can populate task filters in search control.
export function buildTaskMarkers({
    mapData,
    map,
    quests,
    useCanvasMassRenderer,
    hiddenTasks,
    canvasRenderer,
    positionIsInBounds,
    createMapMarker,
    bindDynamicOutline,
    outlineToPoly,
    mouseHoverOutline,
    toggleForceOutline,
    getReactLink,
    addElevation,
    finalizeMarker,
    checkMarkerBounds,
    addLayer,
}) {
    const questItems = L.layerGroup();
    const questObjectives = L.layerGroup();
    const useCanvasForTasks = useCanvasMassRenderer;
    const questSet = new Set();

    // Marker CSS classes must stay stable because search/filter logic depends on them.
    const getMarkerClass = (quest, objective) => {
        const classes = [];
        if (quest.active && !objective.complete) {
            classes.push("active-quest-marker");
        } else {
            classes.push("inactive-quest-marker");
        }
        if (hiddenTasks.includes(quest.id)) {
            classes.push("hidden-task");
        }
        return classes.join(" ");
    };

    for (const quest of quests) {
        for (const obj of quest.objectives) {
            if (obj.possibleLocations) {
                for (const loc of obj.possibleLocations) {
                    if (!loc.map?.id || loc.map.id !== mapData.id) {
                        continue;
                    }
                    for (const position of loc.positions) {
                        if (!positionIsInBounds(position)) {
                            continue;
                        }
                        questSet.add(quest);
                        const questItemMarker = createMapMarker({
                            useCanvas: useCanvasForTasks,
                            position,
                            markerOptions: {
                                className: getMarkerClass(quest, obj),
                                title: obj.questItem.name,
                                id: obj.questItem.id,
                                questId: quest.id,
                            },
                            canvasOptions: {
                                renderer: canvasRenderer,
                                iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/quest_item.png`,
                                iconSize: [24, 24],
                                hitRadius: 8,
                            },
                            domIconOptions: {
                                iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/quest_item.png`,
                                iconSize: [24, 24],
                                popupAnchor: [0, -12],
                                className: getMarkerClass(quest, obj),
                            },
                        });
                        const popupContent = L.DomUtil.create("div");
                        const questLink = getReactLink(`/task/${quest.normalizedName}`, quest.name);
                        popupContent.append(questLink);
                        const questItem = L.DomUtil.create("div", "popup-item", popupContent);
                        const questItemImage = L.DomUtil.create("img", "popup-item", questItem);
                        questItemImage.setAttribute("src", `${obj.questItem.baseImageLink}`);
                        questItem.append(`${obj.questItem.name}`);
                        addElevation({ position }, popupContent);
                        finalizeMarker(questItemMarker, { popupContent });
                        questItemMarker.addTo(questItems);
                        checkMarkerBounds(position);
                    }
                }
            }

            if (obj.zones) {
                for (const zone of obj.zones) {
                    if (!zone.map?.id || zone.map.id !== mapData.id || !positionIsInBounds(zone.position)) {
                        continue;
                    }
                    questSet.add(quest);
                    let rect = null;
                    const zoneMarker = createMapMarker({
                        useCanvas: useCanvasForTasks,
                        position: zone.position,
                        markerOptions: {
                            className: getMarkerClass(quest, obj),
                            title: obj.description,
                            top: zone.top,
                            bottom: zone.bottom,
                            id: zone.id,
                            questId: quest.id,
                            outline: null,
                        },
                        canvasOptions: {
                            renderer: canvasRenderer,
                            iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/quest_objective.png`,
                            iconSize: [24, 24],
                            hitRadius: 8,
                        },
                        domIconOptions: {
                            iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/quest_objective.png`,
                            iconSize: [24, 24],
                            popupAnchor: [0, -12],
                            className: getMarkerClass(quest, obj),
                        },
                    });
                    // Objective outlines are rendered differently by renderer type.
                    if (useCanvasForTasks) {
                        bindDynamicOutline(zoneMarker, map, outlineToPoly(zone.outline), "#e5e200");
                    } else {
                        rect = L.polygon(outlineToPoly(zone.outline), {
                            color: "#e5e200",
                            weight: 1,
                            className: "not-shown",
                        });
                        zoneMarker.options.outline = rect;
                        zoneMarker.on("mouseover", mouseHoverOutline);
                        zoneMarker.on("mouseout", mouseHoverOutline);
                        zoneMarker.on("click", toggleForceOutline);
                    }
                    const popupContent = L.DomUtil.create("div");
                    const questLink = L.DomUtil.create("div", undefined, popupContent);
                    questLink.append(getReactLink(`/task/${quest.normalizedName}`, quest.name));
                    const objectiveText = L.DomUtil.create("div", undefined, popupContent);
                    objectiveText.textContent = `- ${obj.description}`;
                    addElevation(zone, popupContent);
                    finalizeMarker(zoneMarker, { popupContent, bindLevelActivation: false });
                    if (rect) {
                        L.layerGroup([rect, zoneMarker]).addTo(questObjectives);
                    } else {
                        zoneMarker.addTo(questObjectives);
                    }
                    checkMarkerBounds(zone.position);
                }
            }
        }
    }

    if (Object.keys(questItems._layers).length > 0) {
        addLayer(questItems, "quest_item", "Tasks");
    }
    if (Object.keys(questObjectives._layers).length > 0) {
        addLayer(questObjectives, "quest_objective", "Tasks");
    }

    return questSet;
}
