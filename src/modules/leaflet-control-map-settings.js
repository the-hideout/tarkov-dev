import L from 'leaflet';

L.Control.MapSettings = L.Control.extend({
    onAdd: function(map) {
        const className = 'leaflet-control-map-settings';
        var container = this._container = L.DomUtil.create('div', className);
        var collapsed = this.options.collapsed;

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        var form = this._form = L.DomUtil.create('div', className + '-list');
        container.appendChild(form);

        if (collapsed) {
            this._map.on('click', this._collapse, this);
    
            if (!L.Browser.android) {
                L.DomEvent.on(container, {
                    mouseenter: this._expand,
                    mouseleave: this._collapse
                }, this);
            }
        }

        var link = this._settingsLink = L.DomUtil.create('a', className + '-toggle', container);
        link.href = '#';
        link.title = 'Settings';
    
        if (L.Browser.touch) {
            L.DomEvent.on(link, 'click', L.DomEvent.stop);
            L.DomEvent.on(link, 'click', this._expand, this);
        } else {
            L.DomEvent.on(link, 'focus', this._expand, this);
        }
    
        if (!collapsed) {
            this._expand();
        }

        // show only active quests setting
        var activeQuestMarkersDiv = L.DomUtil.create('div', `${className}-active-quests`, form);
        var activeQuestMarkersCheckbox = L.DomUtil.create('input', undefined, activeQuestMarkersDiv);
        activeQuestMarkersCheckbox.id = 'only-active-quest-markers';
        activeQuestMarkersCheckbox.setAttribute('type', 'checkbox');
        if (!!this.options.checked) {
            activeQuestMarkersCheckbox.setAttribute('checked', !!this.options.checked);
            activeQuestMarkersCheckbox.checked = true;
        }
        L.DomEvent.on(activeQuestMarkersCheckbox, 'click', this._onActiveQuestMarkersToggle, this);

        var activeQuestMarkersLabel = L.DomUtil.create('label', undefined, activeQuestMarkersDiv);
        activeQuestMarkersLabel.setAttribute('for', 'only-active-quest-markers');
        activeQuestMarkersLabel.textContent = this.options.activeTasksLabel ?? 'Only show markers for active tasks';

        L.DomUtil.create('div', `${className}-separator player-location-help-separator`, form);

        // show location labels setting
        var playerLocationDiv = L.DomUtil.create('div', `${className}-player-location-help`, form);
        var playerLocationLink = L.DomUtil.create('a', undefined, playerLocationDiv);
        playerLocationLink.setAttribute('href', '/other-tools#tarkov-monitor');
        playerLocationLink.setAttribute('target', '_blank');
        playerLocationLink.textContent = this.options.playerLocationLabel ?? 'Use TarkovMonitor to show your position';

        return container;
    },

    onRemove: function(map) {
        // Nothing to do here
    },

    _onActiveQuestMarkersToggle: function (event) {
        L.DomEvent.stopPropagation(event);
        //L.DomEvent.preventDefault(event);
        if (event.target.checked) {
            this._map._container.classList.add('only-active-quest-markers');
        } else {
            this._map._container.classList.remove('only-active-quest-markers');
        }
        this.options.settingChanged('showOnlyActiveTasks', event.target.checked);
    },

    _expand: function () {
        L.DomUtil.addClass(this._container, 'leaflet-control-map-settings-expanded');
        this._form.style.height = null;
        var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
        if (acceptableHeight < this._form.clientHeight) {
            L.DomUtil.addClass(this._form, 'leaflet-control-map-settings-scrollbar');
            this._form.style.height = acceptableHeight + 'px';
        } else {
            L.DomUtil.removeClass(this._form, 'leaflet-control-map-settings-scrollbar');
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
        this._container.className = this._container.className.replace(' leaflet-control-map-settings-expanded', '');
    },
});

L.control.mapSettings = function(opts) {
    return new L.Control.MapSettings(opts);
}
