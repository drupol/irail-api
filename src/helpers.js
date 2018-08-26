/**
 * Helper class.
 */
class helpers {
  constructor(irail, wikidata) {
    this.irailapi = irail;
    this.wikidata = wikidata;
  }

  /**
   * Get stations with an extra information from wikidata:
   * the adjacent station(s).
   */
  addAdjacentStations = stationsParam => {
    return Promise.resolve(stationsParam).then(stations => {
      return this.wikidata.getAdjacentStations().then(rows => {
        return stations.map(function(station) {
          station.wikidata = station.wikidata || {};

          if (typeof rows[station["@id"]] !== "undefined") {
            station.wikidata.adjacent_station = rows[station["@id"]];
          }

          return station;
        });
      });
    });
  };

  /**
   * Get stations with an extra information from wikidata: the line(s).
   */
  addStationLines = stationsParam => {
    return Promise.resolve(stationsParam).then(stations => {
      return this.wikidata.getLines().then(rows => {
        return stations.map(function(station) {
          station.wikidata = station.wikidata || {};

          if (typeof rows[station["@id"]] !== "undefined") {
            station.wikidata.connecting_line = rows[station["@id"]];
          }

          return station;
        });
      });
    });
  };
}

module.exports = helpers;
