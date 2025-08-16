// unfinished since a simple CSS rule solved the problem lol

import L from 'leaflet';

L.Control.Remote = L.Control.extend({
    options: {
        messageAlt: 'open this page in another browser or window and connect using this id',
        messageTitle: 'ID for remote control',
        messageHelp: 'Go to Tarkov.dev with another browser and enter this ID to control this page from there',
        messageConnect: 'Click to connect',
        messageCopied: 'Copied!',
    },

    onAdd: function(map) {
        const wrapper = L.DomUtil.create('div', 'leaflet-control-remote');
        wrapper.title = this.options.messageAlt;
        wrapper.alt = this.options.messageAlt;

        this.titleDiv = L.DomUtil.create('div', 'update-label', wrapper);
        this.titleDiv.innerText = this.options.messageTitle;

        this.questionDiv = L.DomUtil.create('div', 'session-question', this.titleDiv);

        const questionHover = L.DomUtil.create('span', 'session-question', this.questionDiv);
        questionHover.innerText = '?'

        this.questionPopup = L.DomUtil.create('div', 'session-popup', this.questionDiv);
        this.questionPopup.innerText = this.options.messageHelp;

        this.switchSideButton = L.DomUtil.create('button', 'session-switch-side', this.titleDiv);
        this.switchSideButton.innerText = '<<';

        this.idDiv = L.DomUtil.create('div', 'session-id-container', wrapper);

        this.connectDiv = L.DomUtil.create('div', 'session-id', this.idDiv);

        this.connectDiv.innerText = this.options.messageConnect;

        return wrapper;
    },

    onRemove: function(map) {
        
    },

});

L.control.remote = function(opts) {
    return new L.Control.Remote(opts);
}