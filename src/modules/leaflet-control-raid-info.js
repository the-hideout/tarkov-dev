import L from "leaflet";

import { formattedTarkovTime } from "../components/Time.jsx";

L.Control.RaidInfo = L.Control.extend({
    onAdd: function (map) {
        const wrapper = L.DomUtil.create("div");
        wrapper.classList.add("time-wrapper", "leaflet-control-raid-info");
        this.timeLeftDiv = L.DomUtil.create("div");
        this.timeRightDiv = L.DomUtil.create("div");

        wrapper.append(this.timeLeftDiv);
        wrapper.append(this.timeRightDiv);
        this.duration = L.DomUtil.create("div");
        wrapper.append(this.duration);

        this.players = L.DomUtil.create("div");
        wrapper.append(this.players);

        this.author = L.DomUtil.create("div");
        const byLabel = this.options.byLabel ? this.options.byLabel : "By";
        this.author.innerText = `${byLabel}: `;
        this.authorLink = L.DomUtil.create("a");
        this.authorLink.setAttribute("target", "_blank");
        this.authorLink.setAttribute("re", "noopener noreferrer");
        this.author.append(this.authorLink);
        wrapper.append(this.author);

        if (this.options.map) {
            this.refreshMapData();
        }

        return wrapper;
    },

    onRemove: function (map) {
        clearInterval(this.updateTimeInterval);
    },

    refreshMapData: function () {
        clearInterval(this.updateTimeInterval);
        this.timeLeftDiv.style.display = "";
        this.timeRightDiv.style.display = "";
        if (this.options.map.normalizedName === "the-lab") {
            this.timeLeftDiv.style.display = "none";
            this.timeRightDiv.style.display = "none";
        }
        if (this.options.map.normalizedName === "factory" || this.options.map.normalizedName === "night-factory") {
            this.timeLeftDiv.innerText = "15:28:00";
            this.timeRightDiv.innerText = "03:28:00";
        } else {
            const updateTimes = () => {
                this.timeLeftDiv.innerText = formattedTarkovTime(true);
                this.timeRightDiv.innerText = formattedTarkovTime(false);
            };
            this.updateTimeInterval = setInterval(updateTimes, 50);
        }

        const durLabel = this.options.durationLabel ? this.options.durationLabel : "Duration";
        this.duration.innerText = `${durLabel}: ${this.options.map.duration}`;

        const playersLabel = this.options.playersLabel ? this.options.playersLabel : "Players";
        this.players.innerText = `${playersLabel}: ${this.options.map.players}`;

        if (this.options.map.author) {
            this.author.style.display = "";
            this.authorLink.setAttribute("href", this.options.map.authorLink);
            this.authorLink.innerText = this.options.map.author;
        } else {
            this.author.style.display = "none";
        }
    },
});

L.control.raidInfo = function (opts) {
    return new L.Control.RaidInfo(opts);
};
