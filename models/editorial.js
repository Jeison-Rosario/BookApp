const { Sequelize, DataTypes } = require("sequelize");
const connection = require("../context/appContext");

const editorial = connection.define(
    "editorial",
    {
        idEditorial: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        editorial: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        telefono: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pais: {
            type: DataTypes.STRING(50),
            allowNull: false,
        }
    }
);

module.exports = editorial;