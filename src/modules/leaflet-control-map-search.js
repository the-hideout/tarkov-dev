import L from 'leaflet';

// POC: This is just a proof of concept
L.Control.MapSearch = L.Control.extend({
    options: {
        quests: null,
        placeholderText: null,
        descriptionText: null
    },
    onAdd: function (map) {
        const wrapper = L.DomUtil.create('div');
        wrapper.classList.add('search-wrapper', 'leaflet-control-icon-search', 'maps-search-wrapper');

        const info = L.DomUtil.create('div');
        info.classList.add('maps-search-wrapper-info');
        info.innerHTML = `<b>${this.options.descriptionText ?? "Supports multisearch (e.g. 'labs, ledx, bitcoin')"}</b>`;

        const searchBar = L.DomUtil.create('input');
        searchBar.classList.add = 'maps-search-wrapper-search-bar';
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

        searchBar.addEventListener(
            'input',
            debounce((e) => {
                const inputValue = e.target.value.trim();
        
                // Split the input into multiple search terms and filter out empty strings
                const searchTerms = inputValue
                    .split(',')
                    .map((term) => term.trim().toLowerCase())
                    .filter((term) => term.length > 0);
        
                if (searchTerms.length === 0) {
                    // Reset markers if no valid search terms are provided
                    markers.allMarkers.forEach((marker) => {
                        if ('getElement' in marker && !('_bounds' in marker)) {
                            marker.getElement().classList.remove('not-shown');
                            marker.getElement().classList.remove('pulse');
                        }
                    });
                    return;
                }
        
                // Reassign all markers to prevent layer toggles leading to bugs while toggling layers after a search
                markers.allMarkers = Object.values(map._targets);
        
                // #region Quest Searching
                const foundQuest = this.options.quests.filter((quest) =>
                    searchTerms.some((term) => quest.name.toLowerCase().includes(term))
                );
        
                const { objectiveMarkers, nonObjectiveMarkers } = markers.allMarkers.reduce(
                    (acc, marker) => {
                        if (foundQuest.some((quest) => quest.id === marker.options.questId)) {
                            acc.objectiveMarkers.push(marker);
                        } else {
                            acc.nonObjectiveMarkers.push(marker);
                        }
        
                        return acc;
                    },
                    { objectiveMarkers: [], nonObjectiveMarkers: [] }
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
                            marker.options.title?.toLowerCase().includes(term)
                        )
                    ),
                    ...markers.allMarkers.filter((marker) =>
                        searchTerms.some((term) =>
                            marker.options?.items?.some((item) =>
                                item.toLowerCase().includes(term)
                            )
                        )
                    ),
                ];
        
                markers.itemAndContainerMarkers.forEach((marker) => {
                    if ('getElement' in marker) {
                        marker.getElement().classList.add('pulse');
                        marker.getElement().classList.remove('not-shown');
                    }
                });
                // #endregion
            }, 300)
        );
          

        wrapper.append(searchBar);
        wrapper.append(info);
        return wrapper;
    },
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
