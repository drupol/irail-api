const Promise = require('bluebird');
const moment = require('moment');
const os = require('os');
const fetch = require('make-fetch-happen').defaults({
  cacheManager: os.tmpdir()
});
const { URL } = require('url');
const debug = require('debug')('irail-api');
var extend = require('util')._extend;
const helpers = require('./helpers.js');
const wikidata = require('./wikidata');

/**
 * iRail API class.
 */
class irailapi {
  /**
   * Get the stations.
   *
   * @param {object} params - The query parameters.
   *   This can be:
   *   - format string (optional) The response format
   *     Choices: xml|json|jsonp
   *     Default: json
   *   - lang string (optional) The language of any text or names in the response.
   *     Choices: nl|fr|en|de
   *     Default: en
   *
   * @returns {*|Promise<T>}
   */
  getStations = (params) => {
    params = extend({ format: 'json', lang: 'en' }, params);

    return this._get({ path: 'stations/', params: params });
  };

  /**
   * Get liveboard.
   *
   * @param {object} params
   * @returns {*|Promise<T>}
   */
  getLiveboard = (params) => {
    params = extend({ format: 'json', lang: 'en' }, params);

    return this._get({ path: 'liveboard/', params: params });
  };

  /**
   * Get connections.
   *
   * @param params
   * @returns {*|Promise<T>}
   */
  getConnections = (params) => {
    params = extend({ format: 'json', lang: 'en' }, params);

    return this._get({ path: 'connections/', params: params });
  };

  /**
   * Get vehicle.
   *
   * @param params
   * @returns {*|Promise<T>}
   */
  getVehicle = (params) => {
    params = extend({ format: 'json', lang: 'en' }, params);

    return this._get({ path: 'vehicle/', params: params });
  };

  /**
   * Get disturbances.
   *
   * @param params
   * @returns {*|Promise<T>}
   */
  getDisturbances = (params) => {
    params = extend({ format: 'json', lang: 'en' }, params);

    return this._get({ path: 'disturbances/', params: params });
  };

  /**
   * Get logs.
   *
   * @returns {*|Promise<T>}
   */
  getLogs = () => {
    return this._get({ path: 'logs/' });
  };

  /**
   * Get a resource.
   * @private
   *
   * @param {string} path
   * @param {object} params
   * @returns {*|Promise<T>}
   */
  _get = ({ path, params = {} }) => {
    const url = new URL('http://api.irail.be/' + path);

    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const options = {
      retry: {
        retries: 10,
        maxTimeout: 5000,
        randomize: true
      },
      headers: {
        'User-Agent': 'nodejs drupol/irail-api'
      }
    };

    return fetch(url.href, options)
      .then((response) => {
        if (!response.ok) {
          debug(
            url.href +
              ' status: ' +
              response.status +
              ' message: ' +
              response.statusText
          );
        }
        return response.json();
      })
      .catch(function(err) {
        debug(url.href + ' error: ' + err);
      });
  };

  /**
   * Process stations.
   * @private
   *
   * @param stations
   * @returns {*}
   */
  _processStations = (stations) => {
    return stations.station;
  };

  /**
   * Process every liveboard of every station.
   * @private
   *
   * @param stations
   * @returns {Array}
   */
  _processLiveboards = (stations) => {
    const params = {
      alerts: 'true',
      time: moment().format('HHmm'),
      date: moment().format('DDMMYY')
    };

    return Promise.map(
      stations,
      (station) => {
        params.id = station.id;
        return this.getLiveboard(params);
      },
      { concurrency: 10 }
    ).then(function(departures) {
      return [].concat.apply([], departures);
    });
  };

  /**
   * Returns departures of a specific liveboard.
   * @private
   *
   * @param liveboard
   * @returns {Array}
   */
  _processLiveboardDepartures = (liveboard) => {
    if (!liveboard.hasOwnProperty('departures')) {
      liveboard.departures = { departure: [] };
    }

    if (!liveboard.departures.hasOwnProperty('departure')) {
      liveboard.departures.departure = [];
    }

    return liveboard.departures.departure;
  };

  /**
   * Process every departure of every liveboard.
   * @private
   *
   * @param liveboards
   * @returns {*|PromiseLike<T>|Promise<T>}
   */
  _processDepartures = (liveboards) => {
    return Promise.map(liveboards, this._processLiveboardDepartures).then(
      function(departures) {
        return [].concat.apply([], departures);
      }
    );
  };

  /**
   * Get departures from every station.
   * @private
   *
   * @returns {PromiseLike<T>}
   */
  getDepartures = () => {
    return this.getStations()
      .then(this._processStations)
      .then(this._processLiveboards)
      .then(this._processDepartures);
  };

  /**
   * Get the helper object.
   *
   * @returns {helpers}
   */
  get helpers() {
    return new helpers(this, new wikidata());
  }
}

module.exports = new irailapi();
