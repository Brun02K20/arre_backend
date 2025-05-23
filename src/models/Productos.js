import { DataTypes } from "sequelize";

const productosAttributes = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    idSubCategoria: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    esOculto: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}

const productosMethods = {
    timestamps: false
}

const ProductosModel = {
    productosAttributes,
    productosMethods
}

export {ProductosModel}