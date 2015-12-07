require('dotenv').config({path: '../../envs/.env.test'});

var loopback = require('loopback');
var _ = require('lodash');

var generator = require('./generator');

var server = require('../server.test');

server.start();

var dataSource = server.dataSources.ordrDB;

var Bathhouse = server.models.Bathhouse;
var Room = server.models.Room;
var City = server.models.City;

var cities = [
  {
    name: 'Magnitogorsk',
    slug: 'mgn',
    center: new loopback.GeoPoint({lat: 58.98441315, lng: 53.41167831}),
    timezone: 'Asia/Yekaterinburg'
  },
  {
    name: 'Chelyabinsk',
    slug: 'chel',
    center: new loopback.GeoPoint({lat: 55.163249, lng: 61.435837 }),
    timezone: 'Asia/Yekaterinburg'
  },
  {
    name: 'Yekaterinburg',
    slug: 'ekat',
    center: new loopback.GeoPoint({lat: 56.828420, lng: 60.628636 }),
    timezone: 'Asia/Yekaterinburg'
  }
];

dataSource.automigrate(function(error) {

  if (error) console.log(error);

  _.forEach(cities, function(city) {

    City.create(city, function(error, cityRecord) {

      if (error) console.log(error);

      console.log('created city record', cityRecord.name);
      
      var bathhouses = _.times(5, _.partial(generator.bathhouse, cityRecord.center, cityRecord.id));

      _.forEach(bathhouses, function(bathhouse) {

        Bathhouse.create(bathhouse, {center: cityRecord.center}, function(error, bathhouseRecord) {

          if (error) console.log(error);

          console.log('created bathhouse record');

          var rooms = _.times(10, _.partial(generator.room, bathhouseRecord.id));

          _.forEach(rooms, function(room) {

            Room.create(room, function(error, roomRecord) {

              if (error) console.log(error);
            });
          });

          console.log('created rooms for bathhouse');
        })
      });
    });
  });
});
