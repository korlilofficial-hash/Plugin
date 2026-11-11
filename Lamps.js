(function () {
    'use strict';

    var style = `
        .retro-tv-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03)); background-size: 100% 3px, 3px 100%; pointer-events: none; z-index: 9999; opacity: 0.6; mix-blend-mode: overlay; }
        .tv-noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://media.giphy.com/media/oEI9uWUicGPoY/giphy.gif'); opacity: 0.2; pointer-events: none; z-index: 9998; }
        .channel-num { position: absolute; top: 40px; right: 60px; color: #22ff22; font-family: monospace; font-size: 72px; font-weight: bold; text-shadow: 0 0 15px #00ff00; z-index: 10000; }
        .lampa-tv-card { background: #1a1a1a; border-radius: 5px; padding: 15px; margin-bottom: 10px; cursor: pointer; }
        .lampa-tv-card:hover { background: #333; }
    `;

    function RetroTV() {
        var network = new Lampa.Reguest();
        var items = [];
        var html = $('<div></div>');

        this.create = function () {
            var _this = this;
            if (!$('#retro-style').length) $('head').append('<style id="retro-style">' + style + '</style>');
            network.silent('https://iptv-org.github.io/iptv/countries/ru.m3u', function (data) {
                _this.build(data);
            });
            return html;
        };

        this.build = function (data) {
            var _this = this;
            var lines = data.split('\n');
            var cur = {};
            lines.forEach(function (line) {
                if (line.indexOf('#EXTINF') !== -1) cur.title = line.split(',')[1].trim();
                else if (line.indexOf('http') !== -1) {
                    cur.url = line.trim();
                    items.push(Object.assign({}, cur));
                    cur = {};
                }
            });

            items.forEach(function (item, i) {
                var card = $('<div class="button selector lampa-tv-card"><div>' + (i + 1) + '. ' + item.title + '</div></div>');
                card.on('hover:enter', function () { _this.play(item, i + 1); });
                html.append(card);
            });
            Lampa.Controller.enable('content');
        };

        this.play = function (item, num) {
            var noise = $('<div class="tv-noise"></div><div class="channel-num">' + num + '</div>').appendTo('body');
            setTimeout(function () {
                noise.remove();
                Lampa.Player.run({ url: item.url, title: item.title });
                if (!$('.retro-tv-overlay').length) $('body').append('<div class="retro-tv-overlay"></div>');
            }, 700);
        };
    }

    function add() {
        Lampa.Component.add('retro_tv', RetroTV);
        Lampa.Menu.add({
            title: 'Ламповое ТВ',
            id: 'retro_tv',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="13" rx="2"/><polyline points="16 3 12 7 8 3"/></svg>'
        });
    }

    if (window.appready) add();
    else Lampa.Emitter.ready(add);
})();
