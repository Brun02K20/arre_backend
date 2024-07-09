import express from "express";
import cors from "cors";
import { usuarios_router } from "./routes/usuarios.routes.js";

// creando la aplicacion express
const app = express();
app.use(express.json());
app.use(cors()); // configurando cors para que un cliente frontend pueda hacer peticiones a la api

app.use("/api/arre/usuarios", usuarios_router.router)

export default app;