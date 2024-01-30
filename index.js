// Antigua forma de importar express
//const express = require('express');

// Nueva forma de importar express, debes agregar en el package.json "type": "module"
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import veterinarioRoutes from "./routes/veterinarioRoutes.js";
import pacienteRoutes from "./routes/pacienteRoutes.js";

// Cada linea de codigo en este archivo es un middleware

// La constante app es la que va a tener toda la funcionalidad de express
const app = express();

app.use(express.json()); // Para poder leer datos del req.body

dotenv.config(); // Para poder usar las variables de entorno

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: (origin, callback) => {
    // Verificar si la peticion viene de un dominio que esta en la lista de dominios permitidos
    if (dominiosPermitidos.indexOf(origin) !== -1) {
      // En callback se pasa el mensaje de error ('null' si todo esta bien) y un booleano que indica si se permite o no el acceso
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
};

app.use(cors(corsOptions));

// /api/veterinarios es el prefijo de la ruta que se va a usar
app.use("/api/veterinarios", veterinarioRoutes);
app.use("/api/pacientes", pacienteRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
