import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

const veterinariaSchema = mongoose.Schema({
  nombre: {
    type: String,
    require: true,
    trim: true,
  },
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    trim: true,
  },
  telefono: {
    type: String,
    default: null,
    trim: true,
  },
  web: {
    type: String,
    default: null,
  },
  token: {
    type: String,
    default: generarId(),
  },
  confirmado: {
    type: Boolean,
    default: false,
  },
});

// Antes de que se use el metodo save, se ejecuta todo lo que este dentro de la funcion
veterinariaSchema.pre("save", async function (next) {
  // Si el password no ha sido modificado, no se ejecuta el codigo de abajo
  if (!this.isModified("password")) {
    next(); // next() es para que continue con el siguiente middleware, middleware es una funcion que se ejecuta antes de que se ejecute el controlador
  }

  // this hace referencia al objeto que se esta guardando
  //console.log(this);

  // salt representa las rondas de hasheo o encriptacion
  const salt = await bcrypt.genSalt(10); // 10 es el numero de rondas por defecto, entre mas rondas mas seguro pero mas lento y mas recursos consume
  this.password = await bcrypt.hash(this.password, salt);
});

veterinariaSchema.methods.comprobarPassword = async function (
  passwordFormulario
) {
  // this.password hace referencia al password que esta en la base de datos, que recibimos con el req.body
  // passwordFormulario hace referencia al password que se esta recibiendo
  return await bcrypt.compare(passwordFormulario, this.password);
};

// Indicar el modelo y decirle que tendra el esquema de veterinariaSchema
// EL nombre de Veterinario que esta entre comillas, es el que se usara como referencia en otros modelos
const Veterinario = mongoose.model("Veterinario", veterinariaSchema);
export default Veterinario;
