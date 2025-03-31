const { Sequelize, DataTypes } = require("sequelize");
const connection = require("../context/appContext");

const libro = connection.define(
    "libro",
    {
        idLibro: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        titulo: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        publicacion:{
            type: DataTypes.DATE,
            allowNull: false,
        },
        portada: {
            type: DataTypes.STRING,  
            allowNull: false,         
        }
    }
);

module.exports = libro;