import loopback from 'loopback';
import boot from 'loopback-boot';

const app = loopback();

app.start = () => {

  boot(app, __dirname);
  app.use('/api', loopback.rest());
  app.listen();
};

app.stop = () => {
  console.log(`Web server stop`);
  app.close();
};

module.exports = app;
