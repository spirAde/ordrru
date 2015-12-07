var loopback = require('loopback');
var boot = require('loopback-boot');

var app = loopback();

app.start = function() {

  boot(app, __dirname);
  app.use('/api', loopback.rest());
  app.listen();
};

app.stop = function() {
  console.log(`Web server stop`);
  app.close();
};

module.exports = app;
