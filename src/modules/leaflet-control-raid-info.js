import L from 'leaflet';

import { formattedTarkovTime } from '../components/Time.jsx';

let updateTimeInterval = false;

L.Control.RaidInfo = L.Control.extend({
    onAdd: function(map) {
        clearInterval(updateTimeInterval);
        const wrapper = L.DomUtil.create('div');
        wrapper.classList.add('time-wrapper', 'leaflet-control-raid-info');
        if (this.options.map.normalizedName !== 'the-lab') {
            const timeLeftDiv = L.DomUtil.create('div');
            const timeRightDiv = L.DomUtil.create('div');

            if (this.options.map.normalizedName === 'factory' || this.options.map.normalizedName === 'night-factory') {
                timeLeftDiv.innerText = '15:28:00';
                timeRightDiv.innerText = '03:28:00';
            } else {
                const updateTimes = () => {
                    timeLeftDiv.innerText = formattedTarkovTime(true);
                    timeRightDiv.innerText = formattedTarkovTime(false);
                };
                updateTimeInterval = setInterval(updateTimes, 50);
            }
    
            wrapper.append(timeLeftDiv);
            wrapper.append(timeRightDiv);
        }
        const duration = L.DomUtil.create('div');
        const durLabel = this.options.durationLabel ? this.options.durationLabel : 'Duration';
        duration.innerText = `${durLabel}: ${this.options.map.duration}`;
        wrapper.append(duration);

        const players = L.DomUtil.create('div');
        const playersLabel = this.options.playersLabel ? this.options.playersLabel : 'Players';
        players.innerText = `${playersLabel}: ${this.options.map.players}`;
        wrapper.append(players);

        if (this.options.map.author) {
            const author = L.DomUtil.create('div');
            const byLabel = this.options.byLabel ? this.options.byLabel : 'By';
            author.innerText = `${byLabel}: `;
            const authorLink = L.DomUtil.create('a');
            authorLink.setAttribute('href', this.options.map.authorLink);
            authorLink.setAttribute('target', '_blank');
            authorLink.setAttribute('re', 'noopener noreferrer');
            authorLink.innerText = this.options.map.author;
            author.append(authorLink);
            wrapper.append(author);
        }

        return wrapper;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.raidInfo = function(opts) {
    return new L.Control.RaidInfo(opts);
}