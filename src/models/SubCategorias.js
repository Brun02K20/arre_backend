import { DataTypes } from "sequelize";

const subCategoriasAttributes = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    idCategoria: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}

const subCategoriasMethods = {
    timestamps: false
}

const SubCategoriasModel = {
    subCategoriasAttributes,
    subCategoriasMethods
}

export {SubCategoriasModel}