import express from "express";
import { tokenExtractorMiddleware } from "../middlewares/token-extractor-middleware.js";
import { productos_services } from "../services/productos.service.js";
const router = express.Router();
import multer from "multer"; // para gestionar el archivo a subir a firebase
import dotenv from "dotenv"; // para gestionar las variables de entorno
import { supabase } from "../config/supabase.js";
dotenv.config()

// // configurar firebase e inicializarlo
// // Importa las funciones necesarias de los SDKs que necesitas
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCQNM3Nqb69XvbhP6cRRV9J76xzOucrZFY",
//   authDomain: "arremiami-577e9.firebaseapp.com",
//   projectId: "arremiami-577e9",
//   storageBucket: "arremiami-577e9.appspot.com",
//   messagingSenderId: "845912487604",
//   appId: "1:845912487604:web:717df5297f63e4257889e1"
// };

// // Inicializa Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const storage = getStorage(app);

// Configuración de multer
const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter });


// todos podran ver la carta del restaurante. ANDA
router.get("/carta", async (req, res, next) => {
    try {
        const response = await productos_services.getCarta();
        return res.json(response);
    } catch (error) {
        next(error)
    }
})

// obtencion de carta para el administrador, a fin de que pueda ocultar o mostrar productos
router.get("/carta/admin", tokenExtractorMiddleware, async (req, res, next) => {
    try {
        const response = await productos_services.getCartaAdmin();
        return res.json(response);
    } catch (error) {
        next(error)
    }
})

// solo el admin va a poder ocultar o mostrar un producto
// body = {esOculto: 0}
router.put("/muestra/:id", tokenExtractorMiddleware, async (req, res, next) => {
    try {
        const response = await productos_services.muestraProducto(req.params.id, req.body);
        return res.json(response);
    } catch (error) {
        next(error)
    }
})

// solamente el o los administrador/es del sistema (logueados) van a poder crear un nuevo producto si es necesario. ANDA
router.post("/", tokenExtractorMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        // ANDA EL SUBIDOR DE ARCHIVOS A FIREBASE
        // la foto es opcional
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const filename = Date.now() + '-' + req.file.originalname;

            const { data, error } = await supabase.storage
                .from('arrefotos')
                .upload(`productos/${filename}`, fileBuffer, {
                    contentType: req.file.mimetype,
                    upsert: true,
                });
            
            if (error) {
                return res.status(500).json({ createrror: error.message });
            } else {
                const { data: urlData, error: urlError } = supabase.storage
                    .from('arrefotos')
                    .getPublicUrl(`productos/${filename}`);

                if (urlError) {
                    return res.status(500).json({ urlerror: urlError.message });
                }

                var urlFoto = urlData.publicUrl;
            }
        }

        // el resto de los datos del producto
        const { nombre, precio, idSubCategoria, descripcion } = JSON.parse(req.body.data);
        const producto = {
            nombre,
            precio,
            idSubCategoria,
            descripcion
        };

        req.body = {...producto, foto: urlFoto || null};

        console.log("cuerpo del prodcuto en el router: ", req.body)

        const response = await productos_services.createProducto(req.body);
        return res.json(response);
    } catch (error) {
        next(error)
    }
})

// solamente el o los administrador/es del sistema (logueados) van a poder actualizar un producto si es necesario. ANDA
router.put("/:id", tokenExtractorMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        const {id} = req.params;
        const existingProduct = await productos_services.getProductoById(id);
        let urlFoto = existingProduct.foto;
        // la foto es opcional, si se envía una nueva foto se borra la anterior
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const filename = Date.now() + '-' + req.file.originalname;

            // Borro la foto anterior
            const { data: deleteData, error: deleteError } = await supabase.storage
                .from('arrefotos')
                .remove([`productos/${existingProduct.foto.split('/').pop()}`]);

            if (deleteError) {
                return res.status(500).json({ deleteerror: deleteError.message });
            }

            // Subo la nueva foto
            const { data, error } = await supabase.storage
                .from('arrefotos')
                .upload(`productos/${filename}`, fileBuffer, {
                    contentType: req.file.mimetype,
                    upsert: true,
                });

            if (error) {
                return res.status(500).json({ createrror: error.message });
            } else {
                const { data: urlData, error: urlError } = supabase.storage
                    .from('arrefotos')
                    .getPublicUrl(`productos/${filename}`);

                if (urlError) {
                    return res.status(500).json({ urlerror: urlError.message });
                }
                urlFoto = urlData.publicUrl;
            }
        }

        // el resto de los datos del producto
        const { nombre, precio, idSubCategoria, descripcion } = JSON.parse(req.body.data);
        const producto = {
            nombre,
            precio,
            idSubCategoria,
            descripcion
        };

        req.body = {...producto, foto: urlFoto || null};

        console.log("cuerpo del producto en la actualización: ", req.body)

        const response = await productos_services.editProducto(req.params.id, req.body);
        return res.json(response);
    } catch (error) {
        next(error)
    }
})

// solamente el o los administrador/es del sistema (logueados) van a poder borrar un producto si es necesario. ANDA
router.delete("/:id", tokenExtractorMiddleware, async (req, res, next) => {
    try {
        const existingProduct = await productos_services.getProductoById(req.params.id);
        // Borro la foto del producto
        if (existingProduct.foto) {
            const { data: deleteData, error: deleteError } = await supabase.storage
                .from('arrefotos')
                .remove([`productos/${existingProduct.foto.split('/').pop()}`]);
                
            if (deleteError) {
                return res.status(500).json({ deleteerror: deleteError.message });
            }
        }

        // Borro el producto
        const response = await productos_services.deleteProducto(req.params.id);
        return res.json(response);
    } catch (error) {
        next(error)
    }
})

// solamente el o los administrador/es del sistema (logueados) van a poder subir una foto al carrusel si es necesario. ANDA
router.post("/carrusel", tokenExtractorMiddleware, upload.single('file'),async (req, res, next) => {
    try {
        // la foto es obligaria
        const fileBuffer = req.file.buffer;
        const filename = Date.now() + '-' + req.file.originalname;

        const { data, error } = await supabase.storage
            .from('arrefotos')
            .upload(`carrusel/${filename}`, fileBuffer, {
                contentType: req.file.mimetype,
                upsert: true,
            });
        
        if (error) {
            return res.status(500).json({ createrror: error.message });
        } else {
            const { data: urlData, error: urlError } = supabase.storage
                .from('arrefotos')
                .getPublicUrl(`carrusel/${filename}`);

            if (urlError) {
                return res.status(500).json({ urlerror: urlError.message });
            }

            var urlFoto = urlData.publicUrl;
        }

        return res.json({ message: "Foto subida al carrusel con éxito", urlFoto });
    } catch (error) {
        next(error)
    }
})


// solamente el o los administrador/es del sistema (logueados) van a poder borrar una foto del carrusel si es necesario. ANDA
router.delete("/carrusel/img", tokenExtractorMiddleware, async (req, res, next) => {
    try {
        const { src } = req.body;
        const filename = src.split('/').pop();
        // Borro la foto del carrusel
        const { data: deleteData, error: deleteError } = await supabase.storage
            .from('arrefotos')
            .remove([`carrusel/${filename}`]);
        if (deleteError) {
            return res.status(500).json({ deleteerror: deleteError.message });
        }
        return res.json({ message: "Foto borrada del carrusel con éxito" });
    } catch (error) {
        next(error);
    }
});

// obtener todas las URLs de las fotos en la carpeta carrusel. ANDA
router.get("/carrusel/urls", async (req, res, next) => {
    try {
        const { data, error } = await supabase.storage
            .from('arrefotos')
            .list('carrusel', {
                sortBy: { column: 'name', order: 'asc' },
            });
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const urls = data.map(file => {
            const { data: urlData } = supabase.storage
                .from('arrefotos')
                .getPublicUrl(`carrusel/${file.name}`);
            return urlData.publicUrl;
        });

        return res.json(urls);
    } catch (error) {
        next(error);
    }
});


const productos_router = { router }
export { productos_router }