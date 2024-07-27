import mongoose from "mongoose";

export const usuarioModelo = mongoose.model(
    "usuarios",
    new mongoose.Schema(
      {
        nombre: String,
        apellido: String,
        email: {
          type: String,
          unique: true,
        },
        edad: Number,
        password: String,
        cart: {
          type: mongoose.Types.ObjectId,
          ref: 'Cart'
        },
        rol: {
          type: mongoose.Types.ObjectId,
          ref: "roles",
        },
        documents: [
          {
            name: String,
            reference: String,
          },
        ],
        last_connection: {
          type: Date,
          default: null,
        },
        documento: {
          type: Boolean,
          default: false,
        },
        comprobante: {
          type: Boolean,
          default: false,
        },
        estadoCuenta: {
          type: Boolean,
          default: false,
        },
      },
      { timestamps: true }
    )
  );  