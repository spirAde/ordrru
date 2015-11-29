// helmet

import path from 'path';

import loopback from 'loopback';
import boot from 'loopback-boot';

import renderApplication from './render-application';

const app = loopback();

const bootOptions = {
  appRootDir: __dirname,
  bootScripts: ['./boot/authentication.js', './boot/preload.js']
};

app.use('/build', loopback.static(path.join(__dirname, '../build')));
app.use('/api', app.loopback.rest());

app.use((req, res) => {

  const locale = req.acceptsLanguages(app.get('locales')) || 'ru';

  renderApplication(req.originalUrl, locale).then(({status, content}) => {

    res.status(status);
    res.send(content);

  });
});

app.start = () => {

  boot(app, bootOptions, (error) => {

    if (error) throw error;

    app.listen(() => {
      app.emit('started');
      const baseUrl = app.get('url').replace(/\/$/, '');
      console.log(`Environment ${process.env.NODE_ENV}`);
      console.log(`==> ✓ Web server listening at: ${baseUrl}`);
    });
  });
};

module.exports = app;
