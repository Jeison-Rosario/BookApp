require("dotenv").config();
const { Sequelize } = require("sequelize");

const connection = new Sequelize(
  process.env.MYSQLDATABASE, // Nombre de la base de datos
  process.env.MYSQLUSER,     // Usuario
  process.env.MYSQLPASSWORD, // Contraseña
  {
    dialect: "mysql",
    host: process.env.MYSQLHOST, // Host (Railway)
    port: process.env.MYSQLPORT, // Puerto (Railway)
    logging: false, 
  }
);

module.exports = connection;
