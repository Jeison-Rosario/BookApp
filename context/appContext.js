const { Sequelize } = require('sequelize');
const { db } = require('../config');
module.exports = new Sequelize(db.database, db.username, db.password, {
  dialect: 'mysql', host: db.host, port: db.port, logging: false,
  pool: { max: 3, min: 0, acquire: 30000, idle: 10000 }
});
