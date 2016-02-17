//require('dotenv').config({path: '../../envs/.env.test'});

var _ = require('lodash');

var server = require('../server.test');

server.start();

var dataSource = server.dataSources.ordrDB;
var Room = server.models.Room;
var Order = server.models.Order;

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

  dataSource.automigrate('Order', function(err) {
    if (err) console.log(err);

    //roomIDs.forEach(function(roomId) {
      //datesRange.forEach(function (date, idx) {

        const isTwoDaysOrder = Math.random() < 0.5;
        const startPeriod = isTwoDaysOrder ? _.sample(_.range(120, 144, 3)) : _.sample(_.range(42, 87));
        const endPeriod = isTwoDaysOrder ? _.sample(_.range(6, 30, 3)) : startPeriod + _.sample(_.range(6, 21, 3));

        const record = {
          roomId: roomIDs[0],
          startDate: datesRange[0],
          endDate: isTwoDaysOrder ? moment(datesRange[0]).add(1, 'days').format('YYYY-MM-DD') : datesRange[0],
          startPeriod: startPeriod,
          endPeriod: endPeriod,
          services: [],
          guests: 10,
          sums: {
            datetime: 1000,
            guests: 1000,
            services: 1000
          },
          createdByUser: Math.random() < 0.5
        };

        Order.create(record, function(err) {
          if (err) return;
        });
      //});
    //});
  });

  /*dataSource.automigrate('Schedule', function(err) {

    if (err) console.log(err);

    roomIDs.forEach(function(roomId) {
      datesRange.forEach(function(date, idx) {
        var record = {
          roomId: roomId,
          date: date,
          periods: [
            {period: 0, enable: true, status: 'free'},
            {period: 3, enable: true, status: 'free'},
            {period: 6, enable: true, status: 'free'},
            {period: 9, enable: true, status: 'free'},
            {period: 12, enable: true, status: 'free'},
            {period: 15, enable: true, status: 'free'},
            {period: 18, enable: true, status: 'free'},
            {period: 21, enable: true, status: 'free'},
            {period: 24, enable: true, status: 'free'},
            {period: 27, enable: true, status: 'free'},
            {period: 30, enable: true, status: 'free'},
            {period: 33, enable: true, status: 'free'},
            {period: 36, enable: true, status: 'free'},
            {period: 39, enable: true, status: 'free'},
            {period: 42, enable: true, status: 'free'},
            {period: 45, enable: true, status: 'free'},
            {period: 48, enable: true, status: 'free'},
            {period: 51, enable: true, status: 'free'},
            {period: 54, enable: true, status: 'free'},
            {period: 57, enable: true, status: 'free'},
            {period: 60, enable: true, status: 'free'},
            {period: 63, enable: true, status: 'free'},
            {period: 66, enable: true, status: 'free'},
            {period: 69, enable: true, status: 'free'},
            {period: 72, enable: true, status: 'free'},
            {period: 75, enable: true, status: 'free'},
            {period: 78, enable: true, status: 'free'},
            {period: 81, enable: true, status: 'free'},
            {period: 84, enable: true, status: 'free'},
            {period: 87, enable: true, status: 'free'},
            {period: 90, enable: true, status: 'free'},
            {period: 93, enable: true, status: 'free'},
            {period: 96, enable: true, status: 'free'},
            {period: 99, enable: true, status: 'free'},
            {period: 102, enable: true, status: 'free'},
            {period: 105, enable: true, status: 'free'},
            {period: 108, enable: true, status: 'free'},
            {period: 111, enable: true, status: 'free'},
            {period: 114, enable: true, status: 'free'},
            {period: 117, enable: true, status: 'free'},
            {period: 120, enable: true, status: 'free'},
            {period: 123, enable: true, status: 'free'},
            {period: 126, enable: true, status: 'free'},
            {period: 129, enable: true, status: 'free'},
            {period: 132, enable: true, status: 'free'},
            {period: 135, enable: true, status: 'free'},
            {period: 138, enable: true, status: 'free'},
            {period: 141, enable: true, status: 'free'},
            {period: 144, enable: true, status: 'free'}
          ]
        };
        Schedule.create(record, function(err) {
          if (err) return;
        });
      });
    });
  });*/
});
