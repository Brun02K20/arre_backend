import { usuarios_services } from "../services/usuarios.service.js";
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const response = await usuarios_services.getAll();
        return res.json(response);
    } catch (error) {
        console.log(error)
        return res.json({error: "ERROR"})
    }
})

router.post("/", async (req, res) => {
    try {
        const response = await usuarios_services.createUsuario(req.body);
        return res.json(response);
    } catch (error) {
        console.log(error)
        return res.json({error: "ERROR"})
    }
})

router.post("/login", async (req, res) => {
    try {
        const response = await usuarios_services.login(req.body);
        return res.json(response);
    } catch (error) {
        console.log(error)
        return res.json({error: "ERROR"})
    }
})

const usuarios_router = { router}
export { usuarios_router }