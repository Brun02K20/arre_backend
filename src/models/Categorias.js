import { DataTypes } from "sequelize";

const categoriasAttributes ={
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
}

const categoriasMethods = {
    timestamps: false
}

const CategoriasModel = {
    categoriasAttributes,
    categoriasMethods
}

export {CategoriasModel}