import { Sequelize } from "sequelize"; // importando el framework de ORM
import { UsuariosModel } from "../models/Usuarios.js";

// Creando la conexión a la base de datos
const sequelize = new Sequelize({
    dialect: "mysql",
    host: "bpdlzxsg1tskmexszqon-mysql.services.clever-cloud.com",
    username: "udgktidgcy9fkqli",
    password: "wrvr6qYquGfNfvDNVn1q",
    database: "bpdlzxsg1tskmexszqon"
});

sequelize.define("Usuarios", UsuariosModel.usuariosAttributes, UsuariosModel.usuariosMethods)

// Exportando la conexión a la base de datos
export { sequelize }