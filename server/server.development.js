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
app.use('/api', loopback.rest());

app.use((req, res, next) => {

  if (req.url.split('/')[1] === 'explorer') return next();

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

      console.log(``);
      console.log(`Devtools ${process.env.DEVTOOLS}`);
      console.log(`Server side rendering ${process.env.DEVTOOLS}`);
      console.log(``);

      console.log(`==> ✓ Web server listening at: ${baseUrl}`);
      if (app.get('loopback-component-explorer')) {
        var explorerPath = app.get('loopback-component-explorer').mountPath;
        console.log(`==> ✓ Browse your REST API at ${baseUrl}${explorerPath}`);
      }
    });
  });
};

export default app;
