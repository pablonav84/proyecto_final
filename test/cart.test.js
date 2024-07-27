import { expect } from "chai";
import { config } from "../src/config/config.js";
import { describe, it } from "mocha";
import mongoose from "mongoose";
import supertest from "supertest";

const requester = supertest("http://localhost:8080");

const connDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL,
      {
        dbName: config.DB_NAME
      }
    );
  } catch (error) {
    console.log(`Error al conectar a DB: ${error}`);
  }
};
connDB();

describe("Pruebas de autenticación y acceso a ruta protegida de carts", function(){
  this.timeout(8000)

    let cartId;
    let cookie;
    let token;
    let userLogin= {email: "pablo@test.com", password: "123"}

  beforeEach(async () => {
    // Realizar la solicitud de inicio de sesión y obtener la cookie
    let res = await requester
      .post("/api/sessions/login")
      .send(userLogin);
    cookie = res.headers["set-cookie"];
    token = cookie[0].split(";")[0].split("=")[1];
  });

  it("La ruta /:cid con el metodo GET permite Obtener un cart por su ID", async () => {
    
    cartId = "66706e2d6a5e07a70b2d4ade"
    const res = await requester
      .get(`/api/carritos/${cartId}`)

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("carrito");
    expect(res.body.carrito).to.have.property('_id');
  });

  it('La ruta /:cid/producto/:pid con el método PUT Permite agregar un producto al carrito', async () => {
    const cid = '66706e2d6a5e07a70b2d4ade'; 
    const pid = '660af28ab076382879981e5a'; 

    const res = await requester
      .put(`/api/carritos/${cid}/producto/${pid}`)
      .set("Cookie", cookie)

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("payload");
  });

  it('debería devolver un error si el carrito no existe', async () => {
    const cid = '66706e2d6a5e07a70b2d4ada'; //ID de carrito que no existe
    const pid = '660af28ab076382879981e5a'; 

    const res = await requester
      .put(`/api/carritos/${cid}/producto/${pid}`)
      .set("Cookie", cookie)
    
    expect(res.body.code).to.equal(404);
    expect(res.body.error).to.equal('carrito inexistente');
    expect(res.body.message).to.equal('El Id ingresado es inexistente');
  });

  it('La ruta /:cid/purchase con su método PUT permite finalizar la compra de los productos en el carrito de un usuario', async () => {
    const cid = '66706e2d6a5e07a70b2d4ade';

    const res = await requester
      .put(`/api/carritos/${cid}/purchase`)
      .set("cookie", cookie)

    expect(res.status).to.equal(200);
  });

  it('debería devolver un error si el carrito no existe', async () => {
    const cid = '66706e2d6a5e07a70b2d4ada'; //Id de un carrito inexistente

    const res = await requester
      .put(`/api/carritos/${cid}/purchase`)
      .set("cookie", cookie)
    
    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal('Error inesperado en el servidor');
  });
});