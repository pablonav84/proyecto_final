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
    console.log("DB conectada...!!!");
  } catch (error) {
    console.log(`Error al conectar a DB: ${error}`);
  }
};
connDB();

describe("Pruebas a la ruta /api/sessions, sesiones de usuario", function(){
  this.timeout(8000)

    let cookie;
    let token;
    let userLogin= {email: "pablo@test.com", password: "123"}
    let userMock= { 
      nombre:"pedrito",
      apellido: "paez",
      email:"testing@test.com",
      edad:35,
      password:"123"
   }

    after(async () => {
      // eliminar elementos creados por la prueba en DB
      await mongoose.connection
        .collection("usuarios")
        .deleteMany({ email: "testing@test.com" });
    });
  
it("la ruta /login con el metodo POST permite iniciar sesion", async ()=>{
    let res = await requester
      .post("/api/sessions/login")
      .send(userLogin);
    cookie = res.headers["set-cookie"];
    token = cookie[0].split(";")[0].split("=")[1];
   
    expect(res.status).to.equal(200)
})
  it("La ruta /usuarios con el metodo GET obtiene todos los usuarios registrados de la DB", async () => {
    let res = await requester
    .get("/api/sessions/usuarios")
  
    expect(res.status).to.equal(200)
    expect(res.body).to.have.property("usuarios");
  })

  it("La ruta protegida /current con el metodo GET obtiene los datos del usuario registrado", async () => {
    let res = await requester
    .get("/api/sessions/current")
    .set("cookie", cookie)
    .set("Authorization", `Bearer ${token}`);
    
    expect(res.status).to.equal(200)
    expect(res.body).to.have.property("datosUsuario");
  })

  it('La ruta /registro con el método POST permite crear un nuevo registro de usuario', async () => {
    const res = await requester
    .post('/api/sessions/registro')
    .send(userMock);

    expect(res.status).to.equal(201);
    expect(res.body.status).to.equal("registro correcto");
    expect(res.body).to.have.property("usuario")
  });

  it("La ruta /logout con su método GET permite cerrar la sesion del usuario", async ()=>{
    
    let res = await requester
    .get("/api/sessions/logout")
    
    expect(res.status).to.equal(200);
  })
})