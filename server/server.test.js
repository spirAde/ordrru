import loopback from 'loopback';
import boot from 'loopback-boot';

const app = loopback();

const bootOptions = {
  appRootDir: __dirname,
  bootScripts: [],
};

app.use('/api', loopback.rest());

app.start = () => {
  boot(app, bootOptions, error => {
    app.listen();
  });
};

export default app;
