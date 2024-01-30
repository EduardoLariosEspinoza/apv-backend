import express from "express";
import {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  actualizarPassword,
  actualizarPerfil,
} from "../controllers/veterinarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas para el area publica, no se necesita autenticacion para acceder a estas rutas
router.post("/", registrar);
router.get("/confirmar/:token", confirmar); // Enviar parametros dinamicos
router.post("/login", autenticar);
router.post("/olvide-password", olvidePassword);
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword); // En lugar de tener dos rutas, una get y una post, podemos usar route para tener una sola ruta y que sea mas legible

// Rutas para el area privada
router.get("/perfil", checkAuth, perfil);
router.put("/perfil/:id", checkAuth, actualizarPerfil);
router.put("/actualizar-password", checkAuth, actualizarPassword); // No es necesario enviar el id del veterinario ya que el id se obtiene del token (req.veterinario), obtenido en el middleware checkAuth

export default router;
