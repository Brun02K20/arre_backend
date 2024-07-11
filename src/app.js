import express from "express";
import cors from "cors";
import { usuarios_router } from "./routes/usuarios.routes.js";
import errorHandler from "./middlewares/error-handler-middleware.js";
import { productos_router } from "./routes/productos.routes.js";
import { categorias_router } from "./routes/categorias.routes.js";
import { subcategorias_router } from "./routes/subcategorias.routes.js";

// creando la aplicacion express
const app = express();
app.use(express.json());
app.use(cors()); // configurando cors para que un cliente frontend pueda hacer peticiones a la api

app.use("/api/arre/usuarios", usuarios_router.router)
app.use("/api/arre/categorias", categorias_router.router)
app.use("/api/arre/subcategorias", subcategorias_router.router)
app.use("/api/arre/productos", productos_router.router)

app.use(errorHandler)

export default app;