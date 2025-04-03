import L from 'leaflet';

// POC: This is just a proof of concept
L.Control.QuestSearch = L.Control.extend({
    options: {
        quests: null,
        placeholderText: null,
    },
    onAdd: function (map) {
        const wrapper = L.DomUtil.create('div');
        wrapper.classList.add('search-wrapper', 'leaflet-control-icon-search');
        wrapper.style.margin = '10px 0px';

        const searchBar = L.DomUtil.create('input');
        searchBar.id = 'map-search-bar';
        searchBar.setAttribute('type', 'text');
        searchBar.setAttribute(
            'placeholder',
            this.options.placeholderText ?? 'Task, item or container...',
        );

        const markers = {
            objectiveMarkers: [],
            nonObjectiveMarkers: [],
            itemAndContainerMarkers: [],
            allMarkers: [],
        };

        // Prevent zooming of the map by double clicking the search field
        searchBar.addEventListener('dblclick', (e) => {
            e.stopPropagation();
        });

        // Reset all markers
        searchBar.addEventListener(
            'input',
            debounce((e) => {
                if (e.target.value.length < 2) {
                    if (e.target.value.length === 0) {
                        markers.allMarkers.forEach((marker) => {
                            if ('getElement' in marker && !('_bounds' in marker)) {
                                marker.getElement().classList.remove('not-shown');
                                marker.getElement().classList.remove('pulse');
                            }
                        });
                    }
                    return;
                }

                // Reassign all markers to prevent layer toggles leading to bugs while toggling layers after a search
                markers.allMarkers = Object.values(map._targets);

                // #region Quest searching
                const foundQuest = this.options.quests.filter((quest) => {
                    return quest.name.toLowerCase().includes(e.target.value.toLowerCase());
                });

                const { objectiveMarkers, nonObjectiveMarkers } = markers.allMarkers.reduce(
                    (acc, marker) => {
                        if (foundQuest.some((quest) => quest.id === marker.options.questId)) {
                            acc.objectiveMarkers.push(marker);
                        } else {
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

                // #region Item, Containers and general searching (Should also show e.g. Suitcases, Corpses etc.)
                markers.itemAndContainerMarkers = [
                    ...markers.allMarkers.filter((marker) =>
                        marker.options.title?.toLowerCase().includes(e.target.value.toLowerCase()),
                    ),
                    ...markers.allMarkers.filter((marker) =>
                        marker.options?.items?.some((item) =>
                            item.toLowerCase().includes(e.target.value.toLowerCase()),
                        ),
                    ),
                ];

                markers.itemAndContainerMarkers.forEach((marker) => {
                    if ('getElement' in marker) {
                        marker.getElement().classList.add('pulse');
                        marker.getElement().classList.remove('not-shown');
                    }
                });
            }, 300)
        );
        // #endregion

        wrapper.append(searchBar);
        return wrapper;
    },
});

L.control.questSearch = function (opts) {
    return new L.Control.QuestSearch(opts);
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
