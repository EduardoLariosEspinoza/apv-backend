import jwt from "jsonwebtoken";

const generarJWT = (id) => {
  // Generar JWT con la informacion que queramos agregar
  // No colocar informacion sensible ya que puede ser decodificada facilmente
  // JWT_SECRET sirve para "firmar" el token, lo cual lo hace unico y sirve para verificar que no haya sido modificado, comparando la firma
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generarJWT;
