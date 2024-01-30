import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

const checkAuth = async (req, res, next) => {
  let token;

  // Que el token inicie con Bearer es una convencion
  // Asegurarnos tambien que req.headers contenga authorization entre sus datos, el cual incluye nuestro token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Obten todo lo que venga despues del primer espacio que se encuentre, en este caso [0] == Bearer, [1] == token

      // decoded almacenara la informacion del token, incluyendo la que le pasamos desde generarJWT.js
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica que el token sea valido, si no lo es, lanza un error y se va al catch

      // Al usar req.veterinario, podemos acceder a la informacion del veterinario en cualquier ruta que use checkAuth, lo cual significa que podemos acceder a la informacion del veterinario en la ruta /perfil, por ejemplo
      req.veterinario = await Veterinario.findById(decoded.id).select(
        "-contrasena -confirmado -token" // No queremos que se envie la contrasena en el objeto del veterinario
      ); // Registrar al veterinario que esta autenticado en el request

      return next();
    } catch (error) {
      const e = new Error("Token no valido");
      return res.status(403).json({ message: e.message });
    }
  }

  if (!token) {
    const error = new Error("No autorizado, no hay token");
    res.status(403).json({ message: error.message });
  }

  next();
};

export default checkAuth;
