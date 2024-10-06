import { or } from "sequelize";
import { sequelize } from "../databases/databases.js";

// Crear un producto
// body = {nombre: "nombre del producto", precio: 1000, foto: "url de la foto", idSubCategoria: 2, descripcion: "descripcion del producto"}
const createProducto = async (body) => {
    console.log("cuerpo del producto en el servicio: ", body)
    try {
        const createdProducto = await sequelize.models.Productos.create({
            nombre: body.nombre,
            precio: body.precio,
            foto: body.foto,
            idSubCategoria: body.idSubCategoria,
            descripcion: body.descripcion,
            esOculto: 0
        })

        return createdProducto.dataValues
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') { // si viola las restricciones UNIQUE de nombre de producto
            // Manejar el error de restricción única
            return { error: 'Ya existe un producto con ese nombre' };
        } else {
            // Manejar otros errores
            console.log("ERROR AL CREAR PRODUCTO: ", error);
            return { error: 'Error al crear el producto.' };
        }
    }
}   

// Editar un producto
const editProducto = async (idProducto, body) => {
    const productoAActualizar = await sequelize.models.Productos.findByPk(idProducto);
    if (!productoAActualizar) return { error: "No existe ese producto" };

    productoAActualizar.nombre = body.nombre;
    productoAActualizar.precio = body.precio;
    productoAActualizar.foto = body.foto;
    productoAActualizar.descripcion = body.descripcion;
    await productoAActualizar.save();
}

// Borrar un producto
const deleteProducto = async (idProducto) => {
    const productoABorrar = await sequelize.models.Productos.findByPk(idProducto);
    if (!productoABorrar) return { error: "No existe ese producto" };

    await productoABorrar.destroy();
}

// obtener todos los productos
const getAll = async () => {
    const productos = await sequelize.models.Productos.findAll()
    return productos.map(producto => producto.dataValues)
}

// obtener la carta completa para que los clientes del restaurante puedan verla
const getCarta = async () => {

    const categorias = await sequelize.models.Categorias.findAll({
        attributes: ["nombre", "id"],
        include: {
            model: sequelize.models.SubCategorias,
            required: false,
            include: {
                model: sequelize.models.Productos,
                required: false,
                where: {
                    esOculto: 0
                }
            }
        },
    });

    return categorias.map(categoria => {
        const subcategorias = categoria.SubCategorias.map(subcategoria => subcategoria.dataValues);
        return {
            id: categoria.id,
            nombre: categoria.nombre,
            subcategorias: subcategorias
        };
    });
}

// obtener la carta completa para que los clientes del restaurante puedan verla
const getCartaAdmin = async () => {

    const categorias = await sequelize.models.Categorias.findAll({
        attributes: ["nombre", "id"],
        include: {
            model: sequelize.models.SubCategorias,
            required: false,
            include: {
                model: sequelize.models.Productos,
                required: false,
            }
        }
    });

    return categorias.map(categoria => {
        const subcategorias = categoria.SubCategorias.map(subcategoria => subcategoria.dataValues);
        return {
            id: categoria.id,
            nombre: categoria.nombre,
            subcategorias: subcategorias
        };
    });
}

const muestraProducto = async (idProducto, body) => {
    const producto = await sequelize.models.Productos.findByPk(idProducto)
    if (!producto) {
        return {error: "No existe ese producto"}
    }

    producto.esOculto = body.esOculto
    await producto.save()
    return producto.dataValues
}

const productos_services = { createProducto, editProducto, deleteProducto, getAll, getCarta, muestraProducto, getCartaAdmin }
export { productos_services }