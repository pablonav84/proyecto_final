import { Router } from 'express';
import jwt from "jsonwebtoken";
import ejs from "ejs";
import bcrypt from "bcrypt";
import { passportCall } from '../utils.js';
import { usuarioModelo } from '../dao/models/usuariosModelo.js';
import { auth } from '../middleware/auth.js';
import { config } from '../config/config.js';
import { UsuariosDTO } from '../DTO/usuariosDTO.js';
import { recuperoPassword } from '../mails.js';

export const router=Router()

router.get('/current', passportCall("jwt"), auth(["usuario", "admin"]), async (req, res) => {

  try {
    let usuario = await usuarioModelo.findById(req.user._id).populate('rol').lean();
    const rolUsuario = usuario.rol.descrip;
    const usuarioDTO = new UsuariosDTO(usuario);

    if (rolUsuario === "admin") {
      // Lógica para acciones de administrador (crear, actualizar, eliminar productos)
      // ...
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        mensaje: 'Perfil de administrador',
        datosUsuario: usuarioDTO
      });
    } else if (rolUsuario === "usuario") {
      // Lógica para acciones de usuario (enviar mensajes al chat, agregar productos al carrito)
      // ...
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        mensaje: 'Perfil de usuario',
        datosUsuario: usuarioDTO
      });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el perfil del usuario' });
  }
});


router.get("/usuarios", async(req, res)=>{
    try {
        let usuarios = await usuarioModelo.find().populate("rol").populate("cart").lean();
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ usuarios });
      } catch (error) {
        req.logger.error(`Error Indeterminado`, error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
      }
})


router.post("/registro", passportCall("registro"), (req, res)=>{
  
  let usuario=req.user
  
    res.setHeader('Content-Type','application/json');
    return res.status(201).json({mensaje:"registro correcto", usuario});
})


router.post('/login', passportCall("login"), async (req, res) => {
  
  let usuario = req.user;
  usuario = { ...usuario };
  delete usuario.password;

  // Actualizar el campo "last_connection" con la fecha y hora actual
  usuarioModelo.findOneAndUpdate(
    { _id: usuario._id },
    { last_connection: new Date() },
    { new: true }
  )
    .then((usuarioActualizado) => {
      
      console.log("Conexión iniciada:", usuarioActualizado.last_connection);

      let token = jwt.sign(usuario, config.SECRET, { expiresIn: "1h" });
      res.cookie("coderCookie", token, { maxAge: 1000 * 60 * 60, signed: true, httpOnly: true });

      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(usuarioActualizado);
    })
    .catch((error) => {
      console.error("Error al actualizar la última conexión:", error);
      res.status(500).json({ error: "Error al actualizar la última conexión" });
    });
});


router.get('/logout', passportCall("jwt"), (req, res) => {

  // Eliminar la cookie de autenticación
  res.clearCookie('coderCookie');

  // Actualizar el campo "last_connection" con la fecha y hora actual
  usuarioModelo.findOneAndUpdate(
    { _id: req.user._id },
    { last_connection: new Date() },
    { new: true }
  )
    .then((usuarioActualizado) => {
      // El usuario se ha actualizado correctamente
      console.log("Conexión finalizada:", usuarioActualizado.last_connection);

      // Enviar una respuesta al cliente
      res.send('<script>alert("Logout exitoso"); window.location.href="/?mensaje=Logout exitoso";</script>');
    })
    .catch((error) => {
      // Ocurrió un error al actualizar el usuario
      console.error("Error al actualizar la última conexión:", error);
      res.status(500).send("Error al actualizar la última conexión");
    });
});


//Login con Github
router.get('/github', passportCall("github"), (req,res)=>{})

router.get('/callbackGithub', passportCall("github", {failureRedirect:"/api/sessions/errorGitHub"}), (req,res)=>{

  req.usuario=req.user
  res.setHeader('Content-Type','application/json');
  return res.status(200).json({
      payload:"Login correcto", 
      usuario:req.user
  });
})


router.get("/errorGitHub", (req, res)=>{
  res.setHeader('Content-Type','application/json');
  return res.status(500).json(
      {
          error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
          detalle:`Fallo al autenticar con GitHub`
      }
  )
})


router.post("/recupero01", async(req, res)=>{
  let {email}=req.body
  if(!email){
      res.setHeader('Content-Type','application/json');
      return res.status(400).json({error:`Complete email`})
  }
  let usuario=await usuarioModelo.findOne({email}).lean()
  if(!usuario){
      res.setHeader('Content-Type','application/json');
      return res.status(400).json({error:`No existe usuario...!!!`})
  }
  delete usuario.password // eliminar datos confidenciales...
  let token=jwt.sign(usuario, config.SECRET, {expiresIn:"1h"})
  let url=`http://localhost:8080/api/sessions/recupero02?token=${token}`
  let mensaje=`Ha solicitado reinicio de password. Si no fue usted, avise al 
admin... para continuar haga click <a href="${url}">aqui</a>`

  try {
      await recuperoPassword(email, "Recupero de password", mensaje)
      res.redirect("/recupero01.html?mensaje=Revise su cuenta de correo electrónico y Siga los pasos...")
  } catch (error) {
      console.log(error);
      res.setHeader('Content-Type','application/json');
      return res.status(500).json(
          {
              error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
              detalle:`${error.message}`
          }
      )
  }
})


router.get("/recupero02", async (req, res) => {
const token = req.query.token;

if (!token) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(400).json({ error: "Token no proporcionado" });
}
try {
  ejs.renderFile('./src/public/recupero02.html', { token }, (err, html) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al renderizar la plantilla" });
    }
    res.send(html);
  });
} catch (error) {
  console.log(error);
  res.setHeader('Content-Type', 'application/json');
  return res.status(400).json({ error: "Token inválido" });
}
});


router.post("/recupero03", async (req, res) => {
const { password, password2, token } = req.body;

if (password !== password2) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(400).json({ error: "Las contraseñas no coinciden" });
}
try {
  const tokenExpirado = jwt.decode(token).exp < Date.now() / 1000;

  if (tokenExpirado) {
    return res.redirect('/recupero01.html?error=Link expirado... Ingrese nuevamente su email');
  }
  let usuario = jwt.verify(token, config.SECRET);
  
  if (!usuario) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  const usuarioEncontrado = await usuarioModelo.findById(usuario._id);

  if (!usuarioEncontrado) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  const contrasenaValida = bcrypt.compareSync(password, usuarioEncontrado.password);

  if (contrasenaValida) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la contraseña anterior" });
  } 
  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  await usuarioModelo.findOneAndUpdate({ _id: usuario._id }, { password: hashedPassword });

  res.redirect('/?mensaje=Contraseña actualizada exitosamente');
} catch (error) {
  console.log(error);
  res.setHeader('Content-Type', 'application/json');
  return res.status(500).json({ error: "Error al actualizar la contraseña" });
}
});