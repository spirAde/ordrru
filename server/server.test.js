import loopback from 'loopback';
import boot from 'loopback-boot';

const app = loopback();

const bootOptions = {
  appRootDir: __dirname,
  bootScripts: ['./boot/preload.js'],
};

app.use('/api', loopback.rest());

app.start = () => {
  boot(app, bootOptions, error => {

    if (error) throw error;

    app.listen(() => {
      app.emit('started');

      const baseUrl = app.get('url').replace(/\/$/, '');

      console.log(`Environment ${process.env.NODE_ENV}, DB: ${process.env.DB_NAME}`);

      console.log(`Devtools ${process.env.DEVTOOLS}`);
      console.log(`Server side rendering ${process.env.DEVTOOLS}\n`);

      console.log(`==> ✓ Web server listening at: ${baseUrl}`);

      if (app.get('loopback-component-explorer')) {
        var explorerPath = app.get('loopback-component-explorer').mountPath;
        console.log(`==> ✓ Browse your REST API at ${baseUrl}${explorerPath}`);
      }
    });
  });
};

export default app;
