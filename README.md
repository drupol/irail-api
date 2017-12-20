# iRail-api

Query the [iRail.be API](http://docs.irail.be/). Fully [JS promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) ready.

[irail.be](http://irail.be/) is a plaform providing open data about train transportation in Belgium.
It has an API and this library helps you to query it.

To improve performances, requests caching is enabled by default when it's needed, using the host OS cache(tmp) directory.

# Usage

```javascript
var irailApi = require('irail-api');

// Get the stations.
irailApi.getStations().then(console.log);
```

# Available methods

* getStations
* getLiveboard
* getConnections
* getVehicle
* getDisturbances
* getLogs

Each methods takes a object of parameters.
The list of parameters for each method can be found on [the irail API documentation site](http://docs.irail.be).

The default parameters are:
* `format` set to `json`
* `lang` set to `en`

# Goodies

This package provides extra methods and information that are not provided on iRail by default.

To get train stations and their associated lines, you can use the helpers.

```javascript
var irailApi = require('irail-api');

// Get the stations with their lines.
irailApi.getStations().then(irailApi._processStations).then((stations) => {
  return irailApi.helpers.addStationLines(stations);
}).map(console.log);
```

Output:

```javascript
[{ id: 'BE.NMBS.008884541',
  locationX: '3.856543',
  locationY: '50.449827',
  '@id': 'http://irail.be/stations/NMBS/008884541',
  standardname: 'Quaregnon',
  name: 'Quaregnon',
  wikidata:
   { connecting_line:
      [ { exact_match:
           { type: 'uri',
             value: 'http://irail.be/stations/NMBS/008884541' },
          lineLabel:
           { 'xml:lang': 'en',
             type: 'literal',
             value: 'Line 97 (Infrabel)' },
          lineUrl:
           { type: 'uri',
             value: 'http://www.wikidata.org/entity/Q1891285' } } ] } }
...]
```

It is possible to chain them as well

```javascript
var irailApi = require('irail-api');

irailApi.getStations().then(irailApi._processStations).then((stations) => {
  return irailApi.helpers.addStationLines(stations);
}).then((stations) => {
  return irailApi.helpers.addAdjacentStations(stations);
}).map(console.log);
```

Output:

```javascript
[{ id: 'BE.NMBS.008884541',
   locationX: '3.856543',
   locationY: '50.449827',
   '@id': 'http://irail.be/stations/NMBS/008884541',
   standardname: 'Quaregnon',
   name: 'Quaregnon',
   wikidata: 
    { connecting_line: 
       [ { exact_match:
            { type: 'uri',
              value: 'http://irail.be/stations/NMBS/008884541' },
           lineLabel:
            { 'xml:lang': 'en',
              type: 'literal',
              value: 'Line 97 (Infrabel)' },
           lineUrl:
            { type: 'uri',
              value: 'http://www.wikidata.org/entity/Q1891285' } } ],
      adjacent_station:
       [ { exact_match:
            { type: 'uri',
              value: 'http://irail.be/stations/NMBS/008884541' },
           adjacent_stationLabel:
            { 'xml:lang': 'en',
              type: 'literal',
              value: 'Jemappes railway station' },
           adjacent_stationUrl:
            { type: 'uri',
              value: 'http://www.wikidata.org/entity/Q2411271' } },
         { exact_match:
            { type: 'uri',
              value: 'http://irail.be/stations/NMBS/008884541' },
           adjacent_stationLabel:
            { 'xml:lang': 'en',
              type: 'literal',
              value: 'Saint-Ghislain railway station' },
           adjacent_stationUrl:
            { type: 'uri',
              value: 'http://www.wikidata.org/entity/Q3097536' } } ] } }
...]
```
