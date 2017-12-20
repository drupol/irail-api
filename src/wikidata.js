const os = require('os');
const fetch = require('make-fetch-happen').defaults({
  cacheManager: os.tmpdir()
});
const { URL } = require('url');
const debug = require('debug')('irail-api');

class wikidata {
  /**
   * Get a resource.
   * @private
   *
   * @param {object} params
   * @returns {*|Promise<T>}
   */
  _get = (params) => {
    const url = new URL('https://query.wikidata.org/sparql');

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
        'User-Agent': 'nodejs drupol/irail-api',
        Accept: 'application/sparql-results+json'
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

  getLines = () => {
    const params = {
      query: `SELECT DISTINCT
                ?exact_match
                (?line as ?lineUrl)
                ?lineLabel
              WHERE {
                ?station wdt:P31 wd:Q55488.
                ?station wdt:P17 wd:Q31.
                ?station wdt:P2888 ?exact_match.
                ?station wdt:P81 ?line.
                SERVICE wikibase:label {
                  bd:serviceParam wikibase:language "en".
                }
              }`
    };

    return this._get(params)
      .then((result) => result.results.bindings)
      .then((rows) => {
        const resultset = [];

        rows.forEach(function(row) {
          if (typeof resultset[row.exact_match.value] === 'undefined') {
            resultset[row.exact_match.value] = [];
          }
          resultset[row.exact_match.value].push(row);
        });

        return resultset;
      });
  };

  getAdjacentStations = () => {
    const params = {
      query: `SELECT
                ?exact_match
                (?adjacent_station AS ?adjacent_stationUrl)
                ?adjacent_stationLabel
                ?exact_match_adjacent
              WHERE {
                ?station wdt:P31 wd:Q55488.
                ?station wdt:P17 wd:Q31.
                ?station wdt:P2888 ?exact_match.
                ?station wdt:P197 ?adjacent_station.
                ?adjacent_station wdt:P2888 ?exact_match_adjacent.
                SERVICE wikibase:label {
                  bd:serviceParam wikibase:language "en". 
                }
              }`
    };

    return this._get(params)
      .then((result) => result.results.bindings)
      .then((rows) => {
        const resultset = [];

        rows.forEach(function(row) {
          if (typeof resultset[row.exact_match.value] === 'undefined') {
            resultset[row.exact_match.value] = [];
          }
          resultset[row.exact_match.value].push(row);
        });

        return resultset;
      });
  };
}

module.exports = wikidata;
