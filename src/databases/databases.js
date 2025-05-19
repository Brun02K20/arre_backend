import { Sequelize } from "sequelize"; // importando el framework de ORM
import mysql2 from 'mysql2'; // importo el dialecto mysql, necesario para produccion
import { UsuariosModel } from "../models/Usuarios.js";
import { CategoriasModel } from "../models/Categorias.js";
import { SubCategoriasModel } from "../models/SubCategorias.js";
import { ProductosModel } from "../models/Productos.js";
// ArreFotos23.

// Creando la cadena de conexión a la base de datos
const sequelize = new Sequelize({
    dialect: "mysql",
    dialectModule: mysql2, // necesario para produccion
    host: "bxw5cy1oin0th43tjnnr-mysql.services.clever-cloud.com",
    username: "udgktidgcy9fkqli",
    password: "wrvr6qYquGfNfvDNVn1q",
    database: "bxw5cy1oin0th43tjnnr"
});

// definicion de los modelos de datos en el codigo
sequelize.define("Usuarios", UsuariosModel.usuariosAttributes, UsuariosModel.usuariosMethods)
sequelize.define("Categorias", CategoriasModel.categoriasAttributes, CategoriasModel.categoriasMethods)
sequelize.define("SubCategorias", SubCategoriasModel.subCategoriasAttributes, SubCategoriasModel.subCategoriasMethods)
sequelize.define("Productos", ProductosModel.productosAttributes, ProductosModel.productosMethods)

// definicion de las FKs en el codigo
sequelize.models.SubCategorias.belongsTo(sequelize.models.Categorias, {foreignKey: "idCategoria"})
sequelize.models.Categorias.hasMany(sequelize.models.SubCategorias, {foreignKey: "idCategoria"})

sequelize.models.Productos.belongsTo(sequelize.models.SubCategorias, {foreignKey: "idSubCategoria"})
sequelize.models.SubCategorias.hasMany(sequelize.models.Productos, {foreignKey: "idSubCategoria"})

// Exportando la conexión a la base de datos
export { sequelize }