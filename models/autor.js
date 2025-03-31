const { Sequelize, DataTypes } = require("sequelize");
const connection = require("../context/appContext");

const autor = connection.define(
    "autor",
    {
        idAutor: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        autor: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        correo: {
            type: DataTypes.STRING(60),
            allowNull: false,
        }
    }
);

module.exports = autor;