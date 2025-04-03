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
        const searchBar = document.createElement('input');
        wrapper.style.margin = '10px 0px'
        searchBar.setAttribute('type', 'text');
        searchBar.setAttribute('placeholder', this.options.placeholderText ?? 'Search task...');

        const markers = {
            objectiveMarkers: [],
            nonObjectiveMarkers: [],
            allMarkers: [],
        };

        searchBar.addEventListener('input', (e) => {
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

            // Just set all markers once
            if (markers.allMarkers.length < 10) {
                markers.allMarkers = Object.values(map._targets);   
            }

            const foundQuest = this.options.quests.filter((quest) => {
                return quest.name.toLowerCase().includes(e.target.value.toLowerCase());
            });
            const allObjectivesForQuest = foundQuest.map((quest) => {
                return quest.objectives.map((objective) => {
                    return objective.description;
                });
            });

            const { objectiveMarkers, nonObjectiveMarkers } = Object.values(map._targets).reduce(
                (acc, marker) => {
                    if (allObjectivesForQuest.some((objective) => objective.includes(marker.options.title))) {
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
        });
        wrapper.append(searchBar);
        return wrapper;
    }
});

L.control.questSearch = function (opts) {
    return new L.Control.QuestSearch(opts);
};
