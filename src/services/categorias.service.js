import { sequelize } from "../databases/databases.js";

// Crear una categoria
// body = {nombre: "nombre de la categoria"}
const createCategoria = async (body) => {
    try {
        const createdCategoria = await sequelize.models.Categorias.create({
            nombre: body.nombre
        })

        return createdCategoria.dataValues
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') { // si viola las restricciones UNIQUE de nombre de categoria
            // Manejar el error de restricción única
            return { error: 'Ya existe una categoria con ese nombre' };
        } else {
            // Manejar otros errores
            console.log("ERROR AL CREAR CATEGORIA: ", error);
            return { error: 'Error al crear la categoria.' };
        }
    }
}

// Editar una categoria
// body = {nombre: "nombre nuevo de la categoria"}
const editCategoria = async (idCategoria, body) => {
    const categoriaAActualizar = await sequelize.models.Categorias.findByPk(idCategoria);
    if (!categoriaAActualizar) return { error: "No existe esa categoria" };

    categoriaAActualizar.nombre = body.nombre;
    await categoriaAActualizar.save();
}

// Borrar una categoria
// aca no hay body, solo el id de la categoria
const deleteCategoria = async (idCategoria) => {
    const categoriaABorrar = await sequelize.models.Categorias.findByPk(idCategoria);
    if (!categoriaABorrar) return { error: "No existe esa categoria" };

    await categoriaABorrar.destroy();
}

// obtener todas las categorias, esto es de prueba, no se implementa realmente en el proyecto
const getAll = async () => {
    const categorias = await sequelize.models.Categorias.findAll()
    return categorias.map(categoria => categoria.dataValues)
}   

// para validacion con una nueva subcategoria a crear: 
const getById = async (id) => {
    const categoria = await sequelize.models.Categorias.findByPk(id);
    if (!categoria) return null;
    return categoria;
}


const categorias_services = { createCategoria, editCategoria, deleteCategoria, getAll, getById }
export { categorias_services }