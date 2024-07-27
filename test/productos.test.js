import { expect } from "chai";
import { config } from "../src/config/config.js";
import { describe, it } from "mocha";
import mongoose from "mongoose";
import supertest from "supertest";

const requester = supertest("http://localhost:8080");

const connDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL, {
      dbName: config.DB_NAME,
    });
  } catch (error) {
    console.log(`Error al conectar a DB: ${error}`);
  }
};
connDB();

describe("Pruebas de autenticación y acceso a ruta protegida de productos", function(){
  this.timeout(8000)

  let cookie;
  let token;
  let Productos;
  let productoId;
  let userLogin= {email: "pablo@test.com", password: "123"}

  beforeEach(async () => {
    // Realizar la solicitud de inicio de sesión y obtener la cookie
    let res = await requester
      .post("/api/sessions/login")
      .send(userLogin);
    cookie = res.headers["set-cookie"];
    token = cookie[0].split(";")[0].split("=")[1];
  });

  after(async () => {
    // eliminar elementos creados por la prueba en DB
    await mongoose.connection
      .collection("productos")
      .deleteMany({ category: "testing" });
  });

  it("La ruta /api/productos con su método GET permite obtener todos los productos existentes en la DB", async () => {
    const res = await requester
      .get("/api/productos")
      .set("Cookie", cookie)
      .set("Authorization", `Bearer ${token}`);
    Productos = res.body.productos;

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("productos");
  });

  it("La ruta /:pid con su método GET permite Obtener un producto por su ID", async () => {
    if (Productos.length > 0) {
      productoId = Productos[5]._id;
    } else {
      throw new Error("No hay productos disponibles para obtener un ID");
    }
    const res = await requester
      .get(`/api/productos/${productoId}`)
      .set("Cookie", cookie)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("producto");
    expect(res.body.producto._id).to.equal(productoId);
  });

  it("La ruta /api/productos con su método POST Permite agregar un nuevo producto a la base de datos", async () => {
    const nuevoProducto = {
      title: "Nuevo Producto",
      description: "Descripción del nuevo producto",
      price: 100,
      thumbnail: "url_del_thumbnail",
      code: "ABC123",
      stock: 10,
      category: "testing",
      password: "123",
    };

    const res = await requester
      .post("/api/productos")
      .set("Cookie", cookie)
      .set("Authorization", `Bearer ${token}`)
      .send(nuevoProducto);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("nuevoProducto");
  });

  it("La ruta /:pid con su método PUT permite modificar un producto existente en la base de datos", async () => {
    if (Productos.length > 0) {
      productoId = Productos[5]._id;
    } else {
      throw new Error("No hay productos disponibles para obtener un ID");
    }

    const datosActualizados = {
      price: 200,
    };

    const res = await requester
      .put(`/api/productos/${productoId}`)
      .set("Cookie", cookie)
      .set("Authorization", `Bearer ${token}`)
      .send(datosActualizados);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      `Producto con id ${productoId} modificado`
    );
  });

  it("La ruta /:pid con su método DELETE permite eliminar un producto existente de la base de datos", async () => {
    const productoId = "667076f293b0e84d6a36e55c";

    const res = await requester
      .delete(`/api/productos/${productoId}`)
      .set("Cookie", cookie)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      `Producto con ID ${productoId} eliminado`
    );
  });
});
