require('dotenv').config({path: '../../envs/.env.test'});

var _ = require('lodash');

var server = require('../server.test');

server.start();

var dataSource = server.dataSources.ordrDB;
var Room = server.models.Room;
var Schedule = server.models.Schedule;

var moment = require('moment');

var currDate = moment();
var endDate = moment().add(1, 'months');

var datesRange = [];

while (currDate <= endDate) {
  datesRange.push(currDate);
  currDate = moment(currDate).add(1, 'days');
}

Room.find().then(data => {
  var roomIDs = _.pluck(data, 'id');

  dataSource.automigrate('Schedule', function(err) {

    if (err) console.log(err);

    roomIDs.forEach(function(roomId) {
      datesRange.forEach(function(date, idx) {
        var record = {
          roomId: roomId,
          date: date,
          periods: [
            {period: 0, enable: true},
            {period: 3, enable: true},
            {period: 6, enable: true},
            {period: 9, enable: true},
            {period: 12, enable: true},
            {period: 15, enable: true},
            {period: 18, enable: true},
            {period: 21, enable: true},
            {period: 24, enable: true},
            {period: 27, enable: true},
            {period: 30, enable: true},
            {period: 33, enable: true},
            {period: 36, enable: true},
            {period: 39, enable: true},
            {period: 42, enable: true},
            {period: 45, enable: true},
            {period: 48, enable: true},
            {period: 51, enable: true},
            {period: 54, enable: true},
            {period: 57, enable: true},
            {period: 60, enable: true},
            {period: 63, enable: true},
            {period: 66, enable: true},
            {period: 69, enable: true},
            {period: 72, enable: true},
            {period: 75, enable: true},
            {period: 78, enable: true},
            {period: 81, enable: true},
            {period: 84, enable: true},
            {period: 87, enable: true},
            {period: 90, enable: true},
            {period: 93, enable: true},
            {period: 96, enable: true},
            {period: 99, enable: true},
            {period: 102, enable: true},
            {period: 105, enable: true},
            {period: 108, enable: true},
            {period: 111, enable: true},
            {period: 114, enable: true},
            {period: 117, enable: true},
            {period: 120, enable: true},
            {period: 123, enable: true},
            {period: 126, enable: true},
            {period: 129, enable: true},
            {period: 132, enable: true},
            {period: 135, enable: true},
            {period: 138, enable: true},
            {period: 141, enable: true},
            {period: 144, enable: true}
          ]
        };
        Schedule.create(record, function(err) {
          if (err) return;
        });
      });
    });
  });
});
