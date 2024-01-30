import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);

    // Nos da la url, despues el puerto y los junta para dar la url completa
    const url = `${db.connection.host}:${db.connection.port}`;
    console.log(`Conectado a: ${url}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1); // Detener la app en caso de que haya un error
  }
};

export default conectarDB;
