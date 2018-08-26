'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var helpers = function helpers(irail, wikidata) {
  var _this = this;

  _classCallCheck(this, helpers);

  this.addAdjacentStations = function (stationsParam) {
    return Promise.resolve(stationsParam).then(function (stations) {
      return _this.wikidata.getAdjacentStations().then(function (rows) {
        return stations.map(function (station) {
          station.wikidata = station.wikidata || {};

          if (typeof rows[station['@id']] !== 'undefined') {
            station.wikidata.adjacent_station = rows[station['@id']];
          }

          return station;
        });
      });
    });
  };

  this.addStationLines = function (stationsParam) {
    return Promise.resolve(stationsParam).then(function (stations) {
      return _this.wikidata.getLines().then(function (rows) {
        return stations.map(function (station) {
          station.wikidata = station.wikidata || {};

          if (typeof rows[station['@id']] !== 'undefined') {
            station.wikidata.connecting_line = rows[station['@id']];
          }

          return station;
        });
      });
    });
  };

  this.irailapi = irail;
  this.wikidata = wikidata;
};

module.exports = helpers;