'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require('bluebird');
var moment = require('moment');
var os = require('os');
var fetch = require('make-fetch-happen').defaults({
  cacheManager: os.tmpdir()
});

var _require = require('url'),
    URL = _require.URL;

var debug = require('debug')('irail-api');
var extend = require('util')._extend;
var helpers = require('./helpers.js');
var wikidata = require('./wikidata');

var irailapi = function () {
  function irailapi() {
    var _this = this;

    _classCallCheck(this, irailapi);

    this.getStations = function (params) {
      params = extend({ format: 'json', lang: 'en' }, params);

      return _this._get({ path: 'stations/', params: params });
    };

    this.getLiveboard = function (params) {
      params = extend({ format: 'json', lang: 'en' }, params);

      return _this._get({ path: 'liveboard/', params: params });
    };

    this.getConnections = function (params) {
      params = extend({ format: 'json', lang: 'en' }, params);

      return _this._get({ path: 'connections/', params: params });
    };

    this.getVehicle = function (params) {
      params = extend({ format: 'json', lang: 'en' }, params);

      return _this._get({ path: 'vehicle/', params: params });
    };

    this.getDisturbances = function (params) {
      params = extend({ format: 'json', lang: 'en' }, params);

      return _this._get({ path: 'disturbances/', params: params });
    };

    this.getLogs = function () {
      return _this._get({ path: 'logs/' });
    };

    this._get = function (_ref) {
      var path = _ref.path,
          _ref$params = _ref.params,
          params = _ref$params === undefined ? {} : _ref$params;

      var url = new URL('http://api.irail.be/' + path);

      Object.keys(params).forEach(function (key) {
        return url.searchParams.append(key, params[key]);
      });

      var options = {
        retry: {
          retries: 10,
          maxTimeout: 5000,
          randomize: true
        },
        headers: {
          'User-Agent': 'nodejs drupol/irail-api'
        }
      };

      return fetch(url.href, options).then(function (response) {
        if (!response.ok) {
          debug(url.href + ' status: ' + response.status + ' message: ' + response.statusText);
        }
        return response.json();
      }).catch(function (err) {
        debug(url.href + ' error: ' + err);
      });
    };

    this._processStations = function (stations) {
      return stations.station;
    };

    this._processLiveboards = function (stations) {
      var params = {
        alerts: 'true',
        time: moment().format('HHmm'),
        date: moment().format('DDMMYY')
      };

      return Promise.map(stations, function (station) {
        params.id = station.id;
        return _this.getLiveboard(params);
      }, { concurrency: 10 }).then(function (departures) {
        return [].concat.apply([], departures);
      });
    };

    this._processLiveboardDepartures = function (liveboard) {
      if (!liveboard.hasOwnProperty('departures')) {
        liveboard.departures = { departure: [] };
      }

      if (!liveboard.departures.hasOwnProperty('departure')) {
        liveboard.departures.departure = [];
      }

      return liveboard.departures.departure;
    };

    this._processDepartures = function (liveboards) {
      return Promise.map(liveboards, _this._processLiveboardDepartures).then(function (departures) {
        return [].concat.apply([], departures);
      });
    };

    this.getDepartures = function () {
      return _this.getStations().then(_this._processStations).then(_this._processLiveboards).then(_this._processDepartures);
    };
  }

  _createClass(irailapi, [{
    key: 'helpers',
    get: function get() {
      return new helpers(this, new wikidata());
    }
  }]);

  return irailapi;
}();

module.exports = new irailapi();