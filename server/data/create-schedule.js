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
            {periodId: 0, enable: true},
            {periodId: 3, enable: true},
            {periodId: 6, enable: true},
            {periodId: 9, enable: true},
            {periodId: 12, enable: true},
            {periodId: 15, enable: true},
            {periodId: 18, enable: true},
            {periodId: 21, enable: true},
            {periodId: 24, enable: true},
            {periodId: 27, enable: true},
            {periodId: 30, enable: true},
            {periodId: 33, enable: true},
            {periodId: 36, enable: true},
            {periodId: 39, enable: true},
            {periodId: 42, enable: true},
            {periodId: 45, enable: true},
            {periodId: 48, enable: true},
            {periodId: 51, enable: true},
            {periodId: 54, enable: true},
            {periodId: 57, enable: true},
            {periodId: 60, enable: true},
            {periodId: 63, enable: true},
            {periodId: 66, enable: true},
            {periodId: 69, enable: true},
            {periodId: 72, enable: true},
            {periodId: 75, enable: true},
            {periodId: 78, enable: true},
            {periodId: 81, enable: true},
            {periodId: 84, enable: true},
            {periodId: 87, enable: true},
            {periodId: 90, enable: true},
            {periodId: 93, enable: true},
            {periodId: 96, enable: true},
            {periodId: 99, enable: true},
            {periodId: 102, enable: true},
            {periodId: 105, enable: true},
            {periodId: 108, enable: true},
            {periodId: 111, enable: true},
            {periodId: 114, enable: true},
            {periodId: 117, enable: true},
            {periodId: 120, enable: true},
            {periodId: 123, enable: true},
            {periodId: 126, enable: true},
            {periodId: 129, enable: true},
            {periodId: 132, enable: true},
            {periodId: 135, enable: true},
            {periodId: 138, enable: true},
            {periodId: 141, enable: true},
            {periodId: 144, enable: true}
          ]
        };
        Schedule.create(record, function(err) {
          if (err) return;
        });
      });
    });
  });
});
