import express from "express";
import { tokenExtractorMiddleware } from "../middlewares/token-extractor-middleware.js";
import { productos_services } from "../services/productos.service.js";
const router = express.Router();
import multer from "multer"; // para gestionar el archivo a subir a firebase

// configurar firebase e inicializarlo
// Importa las funciones necesarias de los SDKs que necesitas
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQNM3Nqb69XvbhP6cRRV9J76xzOucrZFY",
  authDomain: "arremiami-577e9.firebaseapp.com",
  projectId: "arremiami-577e9",
  storageBucket: "arremiami-577e9.appspot.com",
  messagingSenderId: "845912487604",
  appId: "1:845912487604:web:717df5297f63e4257889e1"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

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
        console.log("archivo: ", req.file)
        // ANDA EL SUBIDOR DE ARCHIVOS A FIREBASE
        // la foto es obligaria
        const fileBuffer = req.file.buffer;
        const filename = Date.now() + '-' + req.file.originalname;

        // Referencia al bucket de almacenamiento
        const storageRef = ref(storage, `productos/${filename}`);

        // Subir el archivo al bucket
        await uploadBytes(storageRef, fileBuffer);

        // Obtener la URL del archivo recién subido
        const url = await getDownloadURL(storageRef);
        req.body.foto = url;

        // el resto de los datos del producto
        const { nombre, precio, idSubCategoria, descripcion } = JSON.parse(req.body.data);
        const producto = {
            nombre,
            precio,
            idSubCategoria,
            descripcion
        };

        req.body = {...producto, foto: url};

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
        console.log("archivo en actualización de producto: ", req.file)
        // la foto es opcional, si se envía una nueva foto se borra la anterior
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const filename = Date.now() + '-' + req.file.originalname;

            // Referencia al bucket de almacenamiento
            const storageRef = ref(storage, `productos/${filename}`);

            // Subir el archivo al bucket
            await uploadBytes(storageRef, fileBuffer);

            // Obtener la URL del archivo recién subido
            const url = await getDownloadURL(storageRef);
            req.body.foto = url;

            // // Obtener la referencia a la foto anterior en el storage de Firebase
            // const previousFileRef = ref(storage, req.body.foto);

            // // Borrar la foto anterior del storage de Firebase
            // await deleteObject(previousFileRef);
        }

        // el resto de los datos del producto
        const { nombre, precio, idSubCategoria, descripcion } = JSON.parse(req.body.data);
        const producto = {
            nombre,
            precio,
            idSubCategoria,
            descripcion
        };

        req.body = {...producto, foto: req.body.foto};

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
        const response = await productos_services.deleteProducto(req.params.id);
        return res.json(response);
    } catch (error) {
        next(error)
    }
})

// solamente el o los administrador/es del sistema (logueados) van a poder subir una foto al carrusel si es necesario. ANDA
router.post("/carrusel", tokenExtractorMiddleware, upload.single('file'),async (req, res, next) => {
    try {
        console.log("archivo en carrusel: ", req.file)
        // la foto es obligaria
        const fileBuffer = req.file.buffer;
        const filename = Date.now() + '-' + req.file.originalname;

        // Referencia al bucket de almacenamiento
        const storageRef = ref(storage, `carrusel/${filename}`);

        // Subir el archivo al bucket
        await uploadBytes(storageRef, fileBuffer);

        // Obtener la URL del archivo recién subido
        const url = await getDownloadURL(storageRef);
        req.body.foto = url;

        return res.json({ message: "Foto subida al carrusel con éxito", url });
    } catch (error) {
        next(error)
    }
})


// solamente el o los administrador/es del sistema (logueados) van a poder borrar una foto del carrusel si es necesario. ANDA
router.delete("/carrusel/img", tokenExtractorMiddleware, async (req, res, next) => {
    try {
        const { src } = req.body;
        // Obtener la referencia al archivo en el storage de Firebase
        const fileRef = ref(storage, src);

        // Borrar el archivo del storage de Firebase
        await deleteObject(fileRef);

        return res.json({ message: "Foto borrada del carrusel con éxito" });
    } catch (error) {
        next(error);
    }
});

// obtener todas las URLs de las fotos en la carpeta carrusel. ANDA
router.get("/carrusel/urls", async (req, res, next) => {
    try {
        // Obtener la referencia a la carpeta carrusel en el storage de Firebase
        const carruselRef = ref(storage, "carrusel");

        // Obtener la lista de archivos en la carpeta carrusel
        const fileList = await listAll(carruselRef);

        // Obtener las URLs de los archivos en la carpeta carrusel
        const urls = await Promise.all(fileList.items.map(async (fileRef) => {
            return getDownloadURL(fileRef);
        }));

        return res.json(urls);
    } catch (error) {
        next(error);
    }
});


const productos_router = { router }
export { productos_router }