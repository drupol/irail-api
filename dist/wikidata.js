'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var os = require('os');
var fetch = require('make-fetch-happen').defaults({
  cacheManager: os.tmpdir()
});

var _require = require('url'),
    URL = _require.URL;

var debug = require('debug')('irail-api');

var wikidata = function wikidata() {
  var _this = this;

  _classCallCheck(this, wikidata);

  this._get = function (params) {
    var url = new URL('https://query.wikidata.org/sparql');

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
        'User-Agent': 'nodejs drupol/irail-api',
        Accept: 'application/sparql-results+json'
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

  this.getLines = function () {
    var params = {
      query: 'SELECT DISTINCT\n                ?exact_match\n                (?line as ?lineUrl)\n                ?lineLabel\n              WHERE {\n                ?station wdt:P31 wd:Q55488.\n                ?station wdt:P17 wd:Q31.\n                ?station wdt:P2888 ?exact_match.\n                ?station wdt:P81 ?line.\n                SERVICE wikibase:label {\n                  bd:serviceParam wikibase:language "en".\n                }\n              }'
    };

    return _this._get(params).then(function (result) {
      return result.results.bindings;
    }).then(function (rows) {
      var resultset = [];

      rows.forEach(function (row) {
        if (typeof resultset[row.exact_match.value] === 'undefined') {
          resultset[row.exact_match.value] = [];
        }
        resultset[row.exact_match.value].push(row);
      });

      return resultset;
    });
  };

  this.getAdjacentStations = function () {
    var params = {
      query: 'SELECT\n                ?exact_match\n                (?adjacent_station AS ?adjacent_stationUrl)\n                ?adjacent_stationLabel\n                ?exact_match_adjacent\n              WHERE {\n                ?station wdt:P31 wd:Q55488.\n                ?station wdt:P17 wd:Q31.\n                ?station wdt:P2888 ?exact_match.\n                ?station wdt:P197 ?adjacent_station.\n                ?adjacent_station wdt:P2888 ?exact_match_adjacent.\n                SERVICE wikibase:label {\n                  bd:serviceParam wikibase:language "en". \n                }\n              }'
    };

    return _this._get(params).then(function (result) {
      return result.results.bindings;
    }).then(function (rows) {
      var resultset = [];

      rows.forEach(function (row) {
        if (typeof resultset[row.exact_match.value] === 'undefined') {
          resultset[row.exact_match.value] = [];
        }
        resultset[row.exact_match.value].push(row);
      });

      return resultset;
    });
  };
};

module.exports = wikidata;