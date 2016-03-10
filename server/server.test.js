var loopback = require('loopback');
var boot = require('loopback-boot');

var app = loopback();

const bootOptions = {
  appRootDir: __dirname,
  bootScripts: ['./boot/authentication.js'],
};

app.start = function() {

  boot(app, bootOptions);
  app.use('/api', loopback.rest());
  app.listen();
};

app.stop = function() {
  console.log(`Web server stop`);
  app.close();
};

module.exports = app;
