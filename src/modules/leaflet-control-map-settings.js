import L from 'leaflet';

L.Control.MapSettings = L.Control.extend({
    onAdd: function(map) {
        var container = L.DomUtil.create('div');
        container.classList.add('leaflet-control-map-settings');

        var checkbox = L.DomUtil.create('input');
        checkbox.id = 'only-active-quest-markers';
        checkbox.setAttribute('type', 'checkbox');
        if (!!this.options.checked) {
            checkbox.setAttribute('checked', !!this.options.checked);
            checkbox.checked = true;
        }
        checkbox.addEventListener('click', (e) => {
            if (checkbox.checked) {
                map._container.classList.add('only-active-quest-markers');
            } else {
                map._container.classList.remove('only-active-quest-markers');
            }
            this.options.settingChanged('showOnlyActiveTasks', checkbox.checked);
        });
        container.append(checkbox);

        var label = L.DomUtil.create('label');
        label.setAttribute('for', 'only-active-quest-markers');
        label.textContent = this.options.activeTasksLabel ?? 'Only Active Tasks';
        container.append(label);

        return container;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.mapSettings = function(opts) {
    return new L.Control.MapSettings(opts);
}
