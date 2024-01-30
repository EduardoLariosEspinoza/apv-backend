import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  // Crear una instancia de transporte de nodemailer para enviar emails
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  // Enviar email
  const info = await transporter.sendMail({
    from: "Administrador de Pacientes de Veterinaria",
    to: email,
    subject: "Confirma tu cuenta",
    text: "Confirma tu cuenta",
    html: `
      <p>Hola ${nombre}, confirma tu cuenta en APV</p>
      <p>Confirma tu cuenta haciendo click en el siguiente enlace</p>
      <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>

      <p>Si no has sido tu, ignora este email</p>
    `,
  });

  console.log("Mensaje enviado %s", info.messageId);
};

export default emailRegistro;
