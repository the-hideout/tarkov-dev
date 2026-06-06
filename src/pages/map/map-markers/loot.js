import L from "leaflet";

// Build locks and loose loot layers.
// Keeps popup content and icon-selection parity between canvas and DOM renderers.
export function buildLockAndLooseLootMarkers({
    mapData,
    itemsById,
    handbookCategoryById,
    images,
    useCanvasMassRenderer,
    canvasRenderer,
    t,
    tMaps,
    positionIsInBounds,
    createMapMarker,
    appendItemNameIfSingle,
    getReactLink,
    addElevation,
    finalizeMarker,
    checkMarkerBounds,
    addLayer,
}) {
    // Locks
    if (mapData.locks.length > 0) {
        const locks = L.layerGroup();
        const useCanvasForUsable = useCanvasMassRenderer;
        for (const lock of mapData.locks) {
            const key = itemsById[lock.key.id];
            if (!key || !positionIsInBounds(lock.position)) {
                continue;
            }

            checkMarkerBounds(lock.position);
            let lockTypeText;
            if (lock.lockType === "door") {
                lockTypeText = tMaps("Door");
            } else if (lock.lockType === "container") {
                lockTypeText = tMaps("Container");
            } else if (lock.lockType === "trunk") {
                lockTypeText = tMaps("Car Door or Trunk");
            } else {
                lockTypeText = tMaps("Lock");
            }

            const lockMarker = createMapMarker({
                useCanvas: useCanvasForUsable,
                position: lock.position,
                markerOptions: {
                    title: `${tMaps("Lock")}: ${key.name}`,
                    id: key.id,
                },
                canvasOptions: {
                    renderer: canvasRenderer,
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/lock.png`,
                    iconSize: [24, 24],
                    hitRadius: 8,
                },
                domIconOptions: {
                    iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/lock.png`,
                    iconSize: [24, 24],
                    popupAnchor: [0, -12],
                },
            });

            const popupContent = L.DomUtil.create("div");
            const lockTypeNode = L.DomUtil.create("div", undefined, popupContent);
            lockTypeNode.innerHTML = `<strong>${lockTypeText}</strong>`;
            if (lock.needsPower) {
                const powerNode = L.DomUtil.create("div", undefined, popupContent);
                powerNode.innerHTML = `<em>${tMaps("Needs power")}</em>`;
            }
            const lockImage = L.DomUtil.create("img", "popup-item");
            lockImage.setAttribute("src", `${key.baseImageLink}`);
            const lockLink = getReactLink(`/item/${key.normalizedName}`, lockImage);
            lockLink.append(`${key.name}`);
            popupContent.append(lockLink);
            addElevation(lock, popupContent);
            finalizeMarker(lockMarker, { popupContent });
            lockMarker.addTo(locks);
        }
        if (Object.keys(locks._layers).length > 0) {
            addLayer(locks, "lock", "Usable");
        }
    }

    // Loose loot
    if (mapData.lootLoose.length > 0) {
        const looseLootLayers = {};
        const useCanvasForLooseLoot = useCanvasMassRenderer;
        for (const looseLoot of mapData.lootLoose) {
            if (!positionIsInBounds(looseLoot.position)) {
                continue;
            }
            const lootItems = looseLoot.items.map((lootItem) => itemsById[lootItem.id]).filter(Boolean);
            if (lootItems.length === 0) {
                continue;
            }

            let markerTitle = t("Loose Loot");
            const markerCategories = lootItems.reduce((acc, item) => {
                const category = handbookCategoryById[item.handbookCategories[0]?.id];
                if (category) {
                    acc.add(category);
                }
                return acc;
            }, new Set());
            let className = "";
            let lootIcon = null;

            // Keep legacy icon selection: single item -> item icon, single category -> category icon.
            if (!useCanvasForLooseLoot) {
                let iconSize = [24, 24];
                let iconUrl = `${process.env.PUBLIC_URL}/maps/interactive/${images.loose_loot}.png`;
                if (lootItems.length === 1) {
                    const item = lootItems[0];
                    iconUrl = item.baseImageLink;
                    markerTitle = item.name;
                    className = "loot-outline";
                    const pixelWidth = item.width * 63 + 1;
                    const pixelHeight = item.height * 63 + 1;
                    if (item.width > item.height) {
                        const scale = 24 / pixelWidth;
                        iconSize = [24, pixelHeight * scale];
                    } else {
                        const scale = 24 / pixelHeight;
                        iconSize = [pixelWidth * scale, 24];
                    }
                } else if (markerCategories.size === 1) {
                    const category = handbookCategoryById[markerCategories.values().next().value.id];
                    if (category) {
                        iconUrl = category.imageLink;
                        markerTitle = category.name;
                    }
                }
                lootIcon = new L.Icon({
                    iconUrl,
                    iconSize,
                    popupAnchor: [0, -12],
                    className,
                });
            } else if (lootItems.length === 1) {
                markerTitle = lootItems[0].name;
            } else if (markerCategories.size === 1) {
                const category = handbookCategoryById[markerCategories.values().next().value.id];
                if (category) {
                    markerTitle = category.name;
                }
            }

            const markerOptions = {
                title: markerTitle,
                position: looseLoot.position,
                items: lootItems.map((item) => item.name),
                categories: [...markerCategories].map((cat) => cat.normalizedName),
            };

            let lootMarker;
            if (useCanvasForLooseLoot) {
                let canvasIconUrl = `${process.env.PUBLIC_URL}/maps/interactive/${images.loose_loot}.png`;
                let canvasIconSize = [24, 24];
                if (markerCategories.size === 1) {
                    const category = handbookCategoryById[markerCategories.values().next().value.id];
                    canvasIconUrl = category?.imageLink || canvasIconUrl;
                }
                if (lootItems.length === 1) {
                    const item = lootItems[0];
                    canvasIconUrl = item.baseImageLink || canvasIconUrl;
                    const pixelWidth = item.width * 63 + 1;
                    const pixelHeight = item.height * 63 + 1;
                    if (item.width > item.height) {
                        const scale = 24 / pixelWidth;
                        canvasIconSize = [24, pixelHeight * scale];
                    } else {
                        const scale = 24 / pixelHeight;
                        canvasIconSize = [pixelWidth * scale, 24];
                    }
                }
                lootMarker = createMapMarker({
                    useCanvas: true,
                    position: looseLoot.position,
                    markerOptions,
                    canvasOptions: {
                        renderer: canvasRenderer,
                        iconUrl: canvasIconUrl,
                        iconSize: canvasIconSize,
                        hitRadius: lootItems.length === 1 ? 9 : 8,
                    },
                });
            } else {
                lootMarker = L.marker([looseLoot.position.z, looseLoot.position.x], {
                    ...markerOptions,
                    icon: lootIcon,
                    riseOnHover: true,
                });
            }

            const popup = L.DomUtil.create("div");
            const popupContent = L.DomUtil.create("div", undefined, popup);
            for (const lootItem of lootItems) {
                const lootImage = L.DomUtil.create("img", "popup-item");
                lootImage.setAttribute("src", `${lootItem.baseImageLink}`);
                const lootLink = getReactLink(`/item/${lootItem.normalizedName}`, lootImage);
                lootLink.setAttribute("title", lootItem.name);
                appendItemNameIfSingle(lootLink, `${lootItem.name}`, lootItems.length);
                popupContent.append(lootLink);

                const category = handbookCategoryById[lootItem.handbookCategories[0]?.id];
                if (!category) {
                    continue;
                }
                markerCategories.add(category.id);
                if (!looseLootLayers[category.normalizedName]) {
                    looseLootLayers[category.normalizedName] = {
                        layer: L.layerGroup({ category: category.normalizedName }),
                        label: category.name,
                        image: category.imageLink,
                    };
                }
                lootMarker.addTo(looseLootLayers[category.normalizedName].layer);
            }

            addElevation(looseLoot, popup);
            finalizeMarker(lootMarker, { popupContent: popup });
        }

        for (const layerKey in looseLootLayers) {
            addLayer(
                looseLootLayers[layerKey].layer,
                layerKey,
                "Loose Loot",
                looseLootLayers[layerKey].label,
                looseLootLayers[layerKey].image,
            );
        }
    }
}
