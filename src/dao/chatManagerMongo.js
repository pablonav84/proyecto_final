import { chatModelo } from "./models/chat.Modelo.js";

export class ChatManager {
  async guardarMensaje(nombre, mensaje) {
    try {
      const nuevoMensaje = new chatModelo({ nombre, mensaje });
      const mensajeGuardado = await nuevoMensaje.save();
      return mensajeGuardado;
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
      throw error;
    }
  }
  }