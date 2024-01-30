import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
  const { email, nombre } = req.body;

  // Validar que el usuario no exista
  const existeUsuario = await Veterinario.findOne({ email }); // { email: email }

  if (existeUsuario) {
    const error = new Error("El usuario ya existe");

    // 400 es un bad request (solicitud incorrecta)
    return res.status(400).json({ msg: error.message });
  }

  try {
    const veterinario = new Veterinario(req.body);

    // .save() es un método de mongoose para guardar en la base de datos
    const veterinarioGuardado = await veterinario.save();

    emailRegistro({ email, nombre, token: veterinarioGuardado.token });

    res.json(veterinarioGuardado);
  } catch (error) {
    console.log(error);
  }
};

const perfil = (req, res) => {
  const { veterinario } = req; // req.veterinario es el veterinario que se obtuvo en el middleware checkAuth y que se guarda con req.veterinario = ...
  res.json(veterinario);
};

const confirmar = async (req, res) => {
  const { token } = req.params; // req.params es un objeto con los parametros dinamicos, accedemos al llamado token

  // Verificar que el token exista en la base de datos
  const usuarioConfirmar = await Veterinario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error("Token no válido");

    return res.status(404).json({ msg: error.message });
  }

  // Si existia el token, lo eliminamos y confirmamos el usuario
  try {
    usuarioConfirmar.token = null;
    usuarioConfirmar.confirmado = true;

    await usuarioConfirmar.save();

    res.json({ msg: "Usuario confirmado" });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Veterinario.findOne({ email });

  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(403).json({ msg: error.message });
  }

  if (!usuario.confirmado) {
    const error = new Error("El usuario no esta confirmado");
    return res.status(403).json({ msg: error.message });
  }

  // Al tener el metodo compararPassword en el modelo, podemos usarlo con el usuario de la base de datos
  if (await usuario.comprobarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario.id),
    });
  } else {
    const error = new Error("La contraseña es incorrecta");
    return res.status(403).json({ msg: error.message });
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  const existeVeterinario = await Veterinario.findOne({ email });

  // Confirmar que el usuario exista
  if (!existeVeterinario) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({ msg: error.message });
  }

  try {
    // Le asignamos un token al usuario con el email proporcionado, el token servira para indicar cual es el usuario que quiere reestablecer su contraseña en la pagina de reestablecer contraseña
    existeVeterinario.token = generarId();
    await existeVeterinario.save();

    emailOlvidePassword({
      email,
      nombre: existeVeterinario.nombre,
      token: existeVeterinario.token,
    });

    res.json({ msg: "Se envio un correo para reestablecer la contraseña" });
  } catch (error) {
    console.log(error);
  }
};

// Comprobar que el token del apartado de reestablecer contraseña sea valido
const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const tokenValido = await Veterinario.findOne({ token });

  // Aqui hacemos que se muestre el formulario para reestablecer la contraseña o le mostramos que el token no fue valido
  if (tokenValido) {
    res.json({ msg: "Usuario existe" });
  } else {
    const error = new Error("Token no valido");
    res.status(400).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const veterinario = await Veterinario.findOne({ token });

  // Aqui hacemos que se muestre el formulario para reestablecer la contraseña o le mostramos que el token no fue valido
  if (!veterinario) {
    const error = new Error("Token no valido");
    res.status(400).json({ msg: error.message });
  }

  try {
    veterinario.token = null;
    veterinario.password = password;
    await veterinario.save();
    res.json({ msg: "Contraseña actualizada" });
  } catch (error) {
    console.log(error);
  }
};

const actualizarPerfil = async (req, res) => {
  const veterinario = await Veterinario.findById(req.params.id);

  if (!veterinario) {
    const error = new Error("Veterinario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  const { email } = req.body;
  if (veterinario.email !== email) {
    const existeEmail = await Veterinario.findOne({ email });

    if (existeEmail) {
      const error = new Error("El email ya esta en uso");
      return res.status(400).json({ msg: error.message });
    }
  }

  try {
    // No colocamos "|| veterinario.nombre" ya que en el caso de nombre e email ya hay validacion en frontend para que no queden vacios, y en el caso de web y telefono, se le debe permitir al usuario dejarlos vacios para eliminar informacion que ya tenia, como una web que ya no se usa
    veterinario.nombre = req.body.nombre;
    veterinario.email = req.body.email;
    veterinario.web = req.body.web;
    veterinario.telefono = req.body.telefono;

    const veterinarioActualizado = await veterinario.save();

    //console.log(veterinarioActualizado); // Imprimirlo en la consola de la terminal
    res.json(veterinarioActualizado); // Mandarlo al frontend
  } catch (error) {
    console.log(error);
  }
};

const actualizarPassword = async (req, res) => {
  const { id } = req.veterinario;
  const { pwd_actual, pwd_nueva } = req.body;

  const veterinario = await Veterinario.findById(id);

  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(404).json({ msg: error.message });
  }

  if (await veterinario.comprobarPassword(pwd_actual)) {
    veterinario.password = pwd_nueva;
    await veterinario.save();
    res.json({ msg: "Contraseña actualizada" });
  } else {
    const error = new Error("La contraseña actual es incorrecta");
    return res.status(400).json({ msg: error.message });
  }
};

export {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  actualizarPassword,
  actualizarPerfil,
  nuevoPassword,
};
