'use strict';

var util = require('util');

var casual = require('casual');
var _ = require('lodash');

var bathhouseOptions = ['internet', 'bar', 'billiards', 'icehole', 'kitchen'];
var services = {
  massage: ['russian', 'georgian', 'siberian', 'ukrainian', 'belarusian', 'babayski', 'bashkir', 'american'],
  steaming: ['classic', 'sport', 'relax', 'hardcore', 'middle', 'easy', 'nightmare', 'smth'],
  other: ['hookah', 'karaoke', 'barbecue set', 'cards', 'domino', 'backgammon', 'projector', 'whores']
};

var roomOptions = ['jacuzzi', 'billiards', 'pool', 'smoking'];
var types = ['hammam', 'sauna', 'bathhouse'];
var minDuration = [3, 6, 9];

var pricesThresholds = [
  [
    [30, 36, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78],
    [99, 102, 105, 108, 111, 114]
  ],
  [
    [27, 30, 33, 36, 39, 42],
    [63, 66, 69, 72, 75, 78],
    [105, 108, 111, 114, 117]
  ],
  [
    [21, 24, 27, 30, 33],
    [60, 63, 66, 69, 72],
    [96, 99, 102],
    [123, 126]
  ]
];

function clog(data) {
  console.log(util.inspect(data, false, null));
}

function generateRandomPoint(center, radius) {
  var x0 = center.lng;
  var y0 = center.lat;
  // Convert Radius from meters to degrees.
  var rd = radius / 111300;

  var u = Math.random();
  var v = Math.random();

  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);

  var xp = x / Math.cos(y0);

  // Resulting point.
  return {lat: y + y0, lng: xp + x0};
}

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1 / 180;
  var radlat2 = Math.PI * lat2 / 180;
  var radlon1 = Math.PI * lon1 / 180;
  var radlon2 = Math.PI * lon2 / 180;
  var theta = lon1-lon2;
  var radtheta = Math.PI * theta/180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === 'K') { dist = dist * 1.609344 }
  if (unit === 'N') { dist = dist * 0.8684 }
  return dist
}

function generatePricesByDateTime() {
  var pricesDatetime = [];
  var price = _.first(_.shuffle(_.range(700, 2450, 50)));
  var priceWeekend = price + Math.ceil(Math.random() * 500);
  var pricesSchema = pricesThresholds[_.random(0, 2)];

  var pricesPoints = _.map(pricesSchema, function(line) {
    return _.first(_.shuffle(line));
  }).concat(144);

  _.range(0, 7).forEach(function(dayIndex) {

    pricesDatetime[dayIndex] = [];

    pricesPoints.reduce(function(prev, curr) {
      pricesDatetime[dayIndex].push({
        startPeriod: prev,
        endPeriod: curr,
        price: dayIndex === 0 || dayIndex === 6 ? priceWeekend : price
      });

      return curr;
    }, 0);
  });

  return pricesDatetime;
}

function generateServices(type) {
  var items = _.sample(services[type], _.random(1, services[type].length));

  return _.map(items, function(item) {
    return {
      name: item,
      price: _.sample(_.range(1000, 2000, 100), 1)[0]
    }
  });
}

var generator = {
  bathhouse: function(center, cityId) {
    return {
      name: casual.company_name,
      address: casual.address2,
      description: casual.description,
      contactData: {
        phone: [casual.phone],
        email: [casual.email],
        site: [casual.url]
      },
      tableTime: [
        {
          startPeriod: 0,
          endPeriod: 144
        },
        {
          startPeriod: 0,
          endPeriod: 144
        },
        {
          startPeriod: 0,
          endPeriod: 144
        },
        {
          startPeriod: 0,
          endPeriod: 144
        },
        {
          startPeriod: 0,
          endPeriod: 144
        },
        {
          startPeriod: 0,
          endPeriod: 144
        },
        {
          startPeriod: 0,
          endPeriod: 144
        }
      ],
      cityId: cityId,
      location: generateRandomPoint(center, 5000),
      distance: 0,
      isActive: true,
      options: _.sample(bathhouseOptions, _.random(1, bathhouseOptions.length)),
      services: {
        massage: generateServices('massage'),
        steaming: generateServices('steaming'),
        other: generateServices('other')
      }
    }
  },
  room: function(bathhouseId) {
    return {
      bathhouseId: bathhouseId,
      name: casual.title,
      description: casual.description,
      types: _.sample(types, _.random(1, types.length)),
      options: _.sample(roomOptions, _.random(1, roomOptions.length)),
      settings: {
        minDuration: _.first(_.shuffle(minDuration)),
        cleaningTime: 0,
        prepayment: Math.random() < 0.5,
        holdTime: 0
      },
      guest: {
        limit: _.random(12, 18),
        threshold: _.random(8, 10),
        price: _.first(_.shuffle(_.range(100, 500, 50)))
      },
      price: {
        min: 0,
        chunks: generatePricesByDateTime()
      },
      rating: _.random(1, 10),
      popularity: _.random(1, 10)
    }
  }
};

module.exports = generator;