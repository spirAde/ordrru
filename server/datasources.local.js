module.exports = {
  ordrDB: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    name: process.env.DB_NAME,
    connector: 'rethinkdb'
  }
};
