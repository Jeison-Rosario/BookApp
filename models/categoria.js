const { Sequelize, DataTypes } = require("sequelize");
const connection = require("../context/appContext");

const categoria = connection.define(
    "categoria",
    {
        idCategoria: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        categoria: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING(350),
            allowNull: false,
        }
    }
);

module.exports = categoria;