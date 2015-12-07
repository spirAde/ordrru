import path from 'path';
import fs from 'fs';
import moment from 'moment';
import { flatten } from 'lodash/array';
import { pluck } from 'lodash/collection';
import { assign, invert } from 'lodash/object';
import { floor, ceil, min, max } from 'lodash/math';

export default (app, callback) => {

  const Bathhouse = app.models.Bathhouse;
  const City = app.models.City;

  const configFile = path.join(__dirname, '..', '..', 'common', 'data', 'configs.json');

  let commonFilters = {
    datetime: {
      min: moment().format('YYYY-MM-DD'),
      max: moment().add(30, 'days').format('YYYY-MM-DD')
    },
    distance: { min: 0, max: 0, current: 0},
    guest: { min: 0, max: 0, current: 0},
    prepayment: [{isRequired: null, checked: true}, {isRequired: true, checked: false}, {isRequired: false, checked: false}],
    price: { min: 0, max: 0, current: { start: 0, end: 0 } },
    searchName: {
      text: ''
    },
    sorting: [
      { name: 'popularity', checked: true, isDesc: true },
      { name: 'distance', checked: false, isDesc: true },
      { name: 'price', checked: false, isDesc: true }
    ]
  };

  commonFilters.options = pluck(app.get('bathhouseOptions').concat(app.get('roomOptions')), 'option').map(option => {
    return {
      name: option,
      checked: false
    };
  });

  commonFilters.types = pluck(app.get('bathhouseType'), 'type').map(type => {
    return {
      name: type,
      checked: false
    };
  });

  City.find().then(cities => {

    let commonData = {
      mapboxAccessToken: app.get('mapboxAccessToken'),
      periods: app.get('periods'),
      invertPeriods: invert(app.get('periods')),
      organizationType: app.get('organizationType'),
      bathhouseType: app.get('bathhouseType'),
      cities: cities
    };

    let outData = assign({}, commonData, {filters: {}});

    let promises = cities.map(city => {
      return Bathhouse.find({ where: { cityId: city.id }, include: 'rooms' });
    });

    Promise.all(promises).then(bathhouses => {

      cities.forEach((city, index) => {

        const cityBathhouses = bathhouses[index];
        const distancePack = pluck(cityBathhouses, 'distance');

        const cityDistance = {
          min: floor(min(distancePack), 1),
          max: ceil(max(distancePack), 1),
          current: ceil(max(distancePack), 1)
        };

        const bathhouseRooms = flatten(cityBathhouses.map(bathhouse => {
          return bathhouse.rooms();
        }));

        const guestLimits = pluck(bathhouseRooms, 'guest').map(guestData => {
          return guestData.limit + guestData.threshold;
        });

        const datetimePrices = pluck(flatten(pluck(bathhouseRooms, 'price').map(chunks => {
          return flatten(chunks.chunks);
        })), 'price');

        const guest = {
          min: min(guestLimits),
          max: max(guestLimits),
          current: max(guestLimits)
        };

        const prices = {
          min: floor(min(datetimePrices), -2),
          max: ceil(max(datetimePrices), -2),
          current: {
            start: floor(min(datetimePrices), -2),
            end: ceil(max(datetimePrices), -2)
          }
        };

        outData.filters[city.id] = assign({}, commonFilters, {distance: cityDistance, guest: guest, price: prices});
      });

      fs.writeFile(configFile, JSON.stringify(outData, null, 2), function(error) {
        if (error) console.log(error);
        callback();
      });
    });
  });
};
