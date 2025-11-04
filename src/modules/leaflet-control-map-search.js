import L from 'leaflet';

L.Control.MapSearch = L.Control.extend({
    options: {
        quests: null,
        placeholderText: null,
        descriptionText: null,
    },
    onAdd: function (map) {
        const className = 'leaflet-control-icon-search';
        const wrapper = this._container = L.DomUtil.create('div', `search-wrapper ${className} maps-search-wrapper`);

        const collapsed = this.options.collapsed;
        
        L.DomEvent.disableClickPropagation(wrapper);
        L.DomEvent.disableScrollPropagation(wrapper);

        const form = this._form = L.DomUtil.create('div', className + '-list');
        wrapper.appendChild(form);

        if (collapsed) {
            this._map.on('click', this._collapse, this);
    
            if (!L.Browser.android) {
                L.DomEvent.on(wrapper, {
                    mouseenter: this._expand,
                    mouseleave: this._collapse
                }, this);
            }
        }

        const link = this._searchLink = L.DomUtil.create('a', className + '-toggle', wrapper);
        link.href = '#';
        link.title = 'Search';
    
        if (L.Browser.touch) {
            L.DomEvent.on(link, 'click', L.DomEvent.stop);
            L.DomEvent.on(link, 'click', this._expand, this);
        } else {
            L.DomEvent.on(link, 'focus', this._expand, this);
        }
    
        if (!collapsed) {
            this._expand();
        }

        const searchBar = L.DomUtil.create('input', 'maps-search-wrapper-search-bar', form);
        searchBar.setAttribute('type', 'text');
        searchBar.setAttribute(
            'placeholder',
            this.options.placeholderText ?? 'Task, item or container...',
        );

        const info = L.DomUtil.create('div', 'maps-search-wrapper-info', form);
        info.innerHTML = `<b>${this.options.descriptionText ?? "Supports multisearch (e.g. 'labs, ledx, bitcoin')"}</b>`;

        const resetSearch = L.DomUtil.create('button', 'maps-search-wrapper-reset-search', form);
        resetSearch.innerHTML = 'X';

        const markers = {
            objectiveMarkers: [],
            nonObjectiveMarkers: [],
            itemAndContainerMarkers: [],
            allMarkers: [],
        };

        resetSearch.addEventListener('click', () => {
            searchBar.value = '';
            searchBar.dispatchEvent(new Event('input'));
        })

        // Prevent zooming of the map by double clicking the search field
        searchBar.addEventListener('dblclick', (e) => {
            e.stopPropagation();
        });

        searchBar.addEventListener(
            'input',
            debounce((e) => {
                const inputValue = e.target.value.trim();
                this._searchLink.dataset.badge = inputValue;

                // Split the input into multiple search terms and filter out empty strings
                const searchTerms = inputValue
                    .split(',')
                    .map((term) => term.trim().toLowerCase())
                    .filter((term) => term.length > 0);

                if (searchTerms.length === 0) {
                    // Reset markers if no valid search terms are provided
                    markers.allMarkers.forEach((marker) => {
                        if ('getElement' in marker && !('_bounds' in marker)) {
                            const element = marker.getElement();
                            if (!element) {
                                return;
                            }
                            element.classList.remove('not-shown');
                            element.classList.remove('pulse');
                        }
                    });
                    return;
                }

                // Reassign all markers to prevent layer toggles leading to bugs while toggling layers after a search
                markers.allMarkers = Object.values(map._targets);

                // #region Quest Searching
                const foundQuest = this.options.quests.filter((quest) =>
                    searchTerms.some((term) => quest.name.toLowerCase().includes(term)),
                );

                const { objectiveMarkers, nonObjectiveMarkers } = markers.allMarkers.reduce(
                    (acc, marker) => {
                        if (foundQuest.some((quest) => quest.id === marker.options.questId)) {
                            acc.objectiveMarkers.push(marker);
                        } else if (marker.options.markerType !== 'playerPosition') {
                            acc.nonObjectiveMarkers.push(marker);
                        }

                        return acc;
                    },
                    { objectiveMarkers: [], nonObjectiveMarkers: [] },
                );

                markers.objectiveMarkers = objectiveMarkers;
                markers.nonObjectiveMarkers = nonObjectiveMarkers;

                markers.objectiveMarkers.forEach((marker) => {
                    if ('getElement' in marker) {
                        marker.getElement().classList.add('pulse');
                        marker.getElement().classList.remove('not-shown');
                    }
                });

                markers.nonObjectiveMarkers.forEach((marker) => {
                    if ('getElement' in marker) {
                        marker.getElement().classList.add('not-shown');
                        marker.getElement().classList.remove('pulse');
                    }
                });
                // #endregion

                // #region Item, Containers, and General Searching
                markers.itemAndContainerMarkers = [
                    ...markers.allMarkers.filter((marker) =>
                        searchTerms.some((term) =>
                            marker.options.title?.toLowerCase().includes(term),
                        ),
                    ),
                    ...markers.allMarkers.filter((marker) =>
                        searchTerms.some((term) =>
                            marker.options?.items?.some((item) =>
                                item.toLowerCase().includes(term),
                            ),
                        ),
                    ),
                ];

                markers.itemAndContainerMarkers.forEach((marker) => {
                    if ('getElement' in marker) {
                        marker.getElement().classList.add('pulse');
                        marker.getElement().classList.remove('not-shown');
                    }
                });
                // #endregion
            }, 300),
        );

        return wrapper;
    },
    
    _expand: function () {
        L.DomUtil.addClass(this._container, 'leaflet-control-icon-search-expanded');
        this._form.style.height = null;
        var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
        if (acceptableHeight < this._form.clientHeight) {
            L.DomUtil.addClass(this._form, 'leaflet-control-icon-search-scrollbar');
            this._form.style.height = acceptableHeight + 'px';
        } else {
            L.DomUtil.removeClass(this._form, 'leaflet-control-icon-search-scrollbar');
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
        this._container.className = this._container.className.replace(' leaflet-control-icon-search-expanded', '');
    },
    
    addCollapseListeners: function () {
        this._map.on('click', this._collapse, this);  
    
        if (!L.Browser.android) {
            L.DomEvent.on(this._container, {
                mouseenter: this._expand,
                mouseleave: this._collapse
            }, this);
        }
    },
    removeCollapseListeners: function () {
        this._map.off('click', this._collapse, this);  
    
        if (!L.Browser.android) {
            L.DomEvent.off(this._container, {
                mouseenter: this._expand,
                mouseleave: this._collapse
            }, this);
        }
    },
    setCollapse: function (collapsed) {
        this.options.collapsed = collapsed;
        if (collapsed) {
            this.addCollapseListeners();
            this._collapse();
        } else {
            this.removeCollapseListeners();
            this._expand();
        }
    }
});

L.control.mapSearch = function (opts) {
    return new L.Control.MapSearch(opts);
};

// #region Helper functions
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
// #endregion
