import L from "leaflet";

// Build hazards and artillery zones while preserving outline interaction behavior.
export function buildHazardMarkers({
    mapData,
    useCanvasMassRenderer,
    canvasRenderer,
    map,
    t,
    positionIsInBounds,
    outlineToPoly,
    createMapMarker,
    bindDynamicOutline,
    mouseHoverOutline,
    toggleForceOutline,
    addElevation,
    finalizeMarker,
    checkMarkerBounds,
    addLayer,
}) {
    if (mapData.hazards.length === 0 && !mapData.artillery?.zones?.length) {
        return;
    }

    const hazardLayers = {};
    const hazardNames = {};
    const useCanvasForHazards = useCanvasMassRenderer;

    // Shared marker factory for regular hazards and mortar zones.
    const createHazardMarker = ({ hazard, iconName, title, zIndexOffset }) => {
        let rect = null;
        if (!useCanvasForHazards) {
            rect = L.polygon(outlineToPoly(hazard.outline), {
                color: "#ff0000",
                weight: 1,
                className: "not-shown",
            });
        }

        const hazardMarker = createMapMarker({
            useCanvas: useCanvasForHazards,
            position: hazard.position,
            markerOptions: {
                title,
                top: hazard.top,
                bottom: hazard.bottom,
                zIndexOffset,
                outline: rect,
            },
            canvasOptions: {
                renderer: canvasRenderer,
                iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/${iconName}`,
                iconSize: [24, 24],
                hitRadius: 8,
            },
            domIconOptions: {
                iconUrl: `${process.env.PUBLIC_URL}/maps/interactive/${iconName}`,
                iconSize: [24, 24],
                popupAnchor: [0, -12],
            },
        });

        // Canvas and DOM use different outline mechanics; keep both paths explicit.
        if (useCanvasForHazards) {
            bindDynamicOutline(hazardMarker, map, outlineToPoly(hazard.outline), "#ff0000");
        } else {
            hazardMarker.on("mouseover", mouseHoverOutline);
            hazardMarker.on("mouseout", mouseHoverOutline);
            hazardMarker.on("click", toggleForceOutline);
        }
        return { hazardMarker, rect };
    };

    for (const hazard of mapData.hazards) {
        if (!positionIsInBounds(hazard.position)) {
            continue;
        }
        const { hazardMarker, rect } = createHazardMarker({
            hazard,
            iconName: "hazard.png",
            title: hazard.name,
            zIndexOffset: -100,
        });
        const popup = L.DomUtil.create("div");
        const hazardText = L.DomUtil.create("div", undefined, popup);
        hazardText.textContent = hazard.name;
        addElevation(hazard, popup);
        finalizeMarker(hazardMarker, { popupContent: popup, bindLevelActivation: false });
        if (!hazardLayers[hazard.hazardType]) {
            hazardLayers[hazard.hazardType] = L.layerGroup();
            hazardNames[hazard.hazardType] = hazard.name;
        }
        if (rect) {
            L.layerGroup([rect, hazardMarker]).addTo(hazardLayers[hazard.hazardType]);
        } else {
            hazardMarker.addTo(hazardLayers[hazard.hazardType]);
        }
        checkMarkerBounds(hazard.position);
    }

    if (mapData.artillery?.zones?.length > 0) {
        for (const hazard of mapData.artillery.zones) {
            if (!positionIsInBounds(hazard.position)) {
                continue;
            }
            const artyName = t("Mortar");
            const { hazardMarker, rect } = createHazardMarker({
                hazard,
                iconName: "hazard_mortar.png",
                title: artyName,
            });
            const popup = L.DomUtil.create("div");
            const hazardText = L.DomUtil.create("div", undefined, popup);
            hazardText.textContent = t("Mortar");
            addElevation(hazard, popup);
            finalizeMarker(hazardMarker, { popupContent: popup, bindLevelActivation: false });
            if (!hazardLayers.mortar) {
                hazardLayers.mortar = L.layerGroup();
                hazardNames.mortar = artyName;
            }
            if (rect) {
                L.layerGroup([rect, hazardMarker]).addTo(hazardLayers.mortar);
            } else {
                hazardMarker.addTo(hazardLayers.mortar);
            }
            checkMarkerBounds(hazard.position);
        }
    }

    for (const key in hazardLayers) {
        if (Object.keys(hazardLayers[key]._layers).length > 0) {
            addLayer(hazardLayers[key], `hazard_${key}`, "Hazards", hazardNames[key]);
        }
    }
}
