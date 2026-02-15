import L from "leaflet";

L.Control.MapSettings = L.Control.extend({
    options: {
        activeTasksChecked: false,
        activeTasksLabel: "Only show markers for active tasks",
        expandMapLegendLabel: "Don't collapse layers control",
        expandMapLegendChecked: false,
        alwaysShowSnipers: true,
    },
    onAdd: function (map) {
        const className = "leaflet-control-map-settings";
        var container = (this._container = L.DomUtil.create("div", className));
        var collapsed = this.options.collapsed;

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        var form = (this._form = L.DomUtil.create("div", className + "-list"));
        container.appendChild(form);

        if (collapsed) {
            this._map.on("click", this._collapse, this);

            if (!L.Browser.android) {
                L.DomEvent.on(
                    container,
                    {
                        mouseenter: this._expand,
                        mouseleave: this._collapse,
                    },
                    this,
                );
            }
        }

        var link = (this._settingsLink = L.DomUtil.create("a", className + "-toggle", container));
        link.href = "#";
        link.title = "Settings";

        if (L.Browser.touch) {
            L.DomEvent.on(link, "click", L.DomEvent.stop);
            L.DomEvent.on(link, "click", this._expand, this);
        } else {
            L.DomEvent.on(link, "focus", this._expand, this);
        }

        if (!collapsed) {
            this._expand();
        }

        this._eventTarget = new EventTarget();

        // keep legend expanded
        const expandMapLegendDiv = L.DomUtil.create("div", `${className}-setting-container`, form);

        const expandMapLegendLabel = L.DomUtil.create("label", undefined, expandMapLegendDiv);
        expandMapLegendLabel.setAttribute("for", "expandMapLegend");

        const expandMapLegendCheckbox = L.DomUtil.create("input", undefined, expandMapLegendLabel);
        expandMapLegendCheckbox.id = "expandMapLegend";
        expandMapLegendCheckbox.setAttribute("type", "checkbox");
        if (!!this.options.expandMapLegendChecked) {
            expandMapLegendCheckbox.setAttribute("checked", !!this.options.expandMapLegendChecked);
            expandMapLegendCheckbox.checked = true;
        }
        L.DomEvent.on(expandMapLegendCheckbox, "click", this._onSettingChanged, this);

        const expandMapLegendLabelContent = L.DomUtil.create("span", undefined, expandMapLegendLabel);
        expandMapLegendLabelContent.textContent = this.options.expandMapLegendLabel;

        // keep search expanded
        const expandSearchDiv = L.DomUtil.create("div", `${className}-setting-container`, form);

        const expandSearchLabel = L.DomUtil.create("label", undefined, expandSearchDiv);
        expandSearchLabel.setAttribute("for", "expandSearch");

        const expandSearchCheckbox = L.DomUtil.create("input", undefined, expandSearchLabel);
        expandSearchCheckbox.id = "expandSearch";
        expandSearchCheckbox.setAttribute("type", "checkbox");
        if (!!this.options.expandSearchChecked) {
            expandSearchCheckbox.setAttribute("checked", !!this.options.expandSearchChecked);
            expandSearchCheckbox.checked = true;
        }
        L.DomEvent.on(expandSearchCheckbox, "click", this._onSettingChanged, this);

        const expandSearchLabelContent = L.DomUtil.create("span", undefined, expandSearchLabel);
        expandSearchLabelContent.textContent = this.options.expandSearchLabel;

        // show only active quests setting
        const activeQuestMarkersDiv = L.DomUtil.create("div", `${className}-setting-container`, form);

        const activeQuestMarkersLabel = L.DomUtil.create("label", undefined, activeQuestMarkersDiv);
        activeQuestMarkersLabel.setAttribute("for", "showOnlyActiveTasks");

        const activeQuestMarkersCheckbox = L.DomUtil.create("input", undefined, activeQuestMarkersLabel);
        activeQuestMarkersCheckbox.id = "showOnlyActiveTasks";
        activeQuestMarkersCheckbox.setAttribute("type", "checkbox");
        if (!!this.options.activeTasksChecked) {
            activeQuestMarkersCheckbox.setAttribute("checked", !!this.options.activeTasksChecked);
            activeQuestMarkersCheckbox.checked = true;
        }
        L.DomEvent.on(activeQuestMarkersCheckbox, "click", this._onSettingChanged, this);

        const activeQuestMarkersLabelContent = L.DomUtil.create("span", undefined, activeQuestMarkersLabel);
        activeQuestMarkersLabelContent.textContent = this.options.activeTasksLabel;

        // always show snipers setting
        const alwaysShowSnipersDiv = L.DomUtil.create("div", `${className}-setting-container`, form);

        const alwaysShowSnipersLabel = L.DomUtil.create("label", undefined, alwaysShowSnipersDiv);
        alwaysShowSnipersLabel.setAttribute("for", "alwaysShowSnipers");

        const alwaysShowSnipersCheckbox = L.DomUtil.create("input", undefined, alwaysShowSnipersLabel);
        alwaysShowSnipersCheckbox.id = "alwaysShowSnipers";
        alwaysShowSnipersCheckbox.setAttribute("type", "checkbox");
        if (!!this.options.alwaysShowSnipers) {
            alwaysShowSnipersCheckbox.setAttribute("checked", !!this.options.alwaysShowSnipers);
            alwaysShowSnipersCheckbox.checked = true;
        }
        L.DomEvent.on(alwaysShowSnipersCheckbox, "click", this._onSettingChanged, this);

        const alwaysShowSnipersLabelContent = L.DomUtil.create("span", undefined, alwaysShowSnipersLabel);
        alwaysShowSnipersLabelContent.textContent = this.options.alwaysShowSnipersLabel;

        L.DomUtil.create("div", `${className}-separator player-location-help-separator`, form);

        // show location labels setting
        const playerLocationDiv = L.DomUtil.create("div", `${className}-player-location-help`, form);
        const playerLocationLink = L.DomUtil.create("a", undefined, playerLocationDiv);
        playerLocationLink.setAttribute("href", "/tarkov-monitor#website-integration");
        playerLocationLink.setAttribute("target", "_blank");
        playerLocationLink.textContent = this.options.playerLocationLabel ?? "Use TarkovMonitor to show your position";

        return container;
    },

    onRemove: function (map) {
        // Nothing to do here
    },

    on: function (eventType, listener, options) {
        this._eventTarget.addEventListener(eventType, listener, options);
    },

    once: function (eventType, listener, options) {
        this._eventTarget.addEventListener(eventType, listener, {
            ...options,
            once: true,
        });
    },

    off: function (eventType, listener, options) {
        this._eventTarget.removeEventListener(eventType, listener, options);
    },

    _onSettingChanged: function (e) {
        const event = new Event("settingChanged");
        event.settingName = e.target.id;
        event.settingValue = e.target.checked ?? e.target.value;
        this._eventTarget.dispatchEvent(event);
    },

    _onActiveQuestMarkersToggle: function (event) {
        L.DomEvent.stopPropagation(event);
        //L.DomEvent.preventDefault(event);
        if (event.target.checked) {
            this._map._container.classList.add("only-active-quest-markers");
        } else {
            this._map._container.classList.remove("only-active-quest-markers");
        }
        this.options.settingChanged("showOnlyActiveTasks", event.target.checked);
    },

    _expand: function () {
        L.DomUtil.addClass(this._container, "leaflet-control-map-settings-expanded");
        this._form.style.height = null;
        var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
        if (acceptableHeight < this._form.clientHeight) {
            L.DomUtil.addClass(this._form, "leaflet-control-map-settings-scrollbar");
            this._form.style.height = acceptableHeight + "px";
        } else {
            L.DomUtil.removeClass(this._form, "leaflet-control-map-settings-scrollbar");
        }

        return this;
    },

    _expandIfNotCollapsed: function () {
        if (this._map && !this.options.collapsed) {
            this._expand();
        }
        return this;
    },

    _collapse: function () {
        this._container.className = this._container.className.replace(" leaflet-control-map-settings-expanded", "");
    },
});

L.control.mapSettings = function (opts) {
    return new L.Control.MapSettings(opts);
};
