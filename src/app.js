import express from 'express';
import passport from 'passport';
import { engine } from "express-handlebars";
import cookieParser from 'cookie-parser';
import path from "path";
import { Server } from 'socket.io';
import cluster from "cluster";
import os from "os";
import {fakerES_MX as faker} from '@faker-js/faker'
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from "swagger-ui-express";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { initPassport } from './config/passport.config.js';
import { UsuariosRouter } from "./routes/router/usuariosRouter.js";
import { router as sessionsRouter } from './routes/sessionsRouter.js';
import { router as carritosRouter } from './routes/carritosRouter.js';
import { ProductosRouter } from './routes/router/productosRouter.js';
import { config } from './config/config.js';
import __dirname, { logger, middLogg } from "./utils.js";
import {router as vistasRouter} from "./routes/vistasRouter.js"
import { router as mailRouter } from "./routes/mailRouter.js"
import { ChatManager } from './dao/chatManagerMongo.js';
import { router as mockingRouter } from "./routes/mockingRouter.js"; 
import { router as testLogs } from "./routes/testLogs.js"
import { router as pagosRouter } from "./routes/pagosRouter.js"

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-3297332412137299-071809-dcf360822902bfbdb82289bde3bc2ba4-1905396539' });

if(cluster.isPrimary){
    console.log(os.cpus())
    console.log(`Soy el proceso primary, con id ${process.pid}, y voy a generar nodos...`)
    for(let i=0; i<os.cpus().length; i++){
        cluster.fork()
    }

    cluster.on("message", (worker, message)=>{
        console.log("Primario escucho:", worker.id, message)
    })

    cluster.on("disconnect", worker=>{
        console.log(`El worker ${worker.id} se ha desconectado... generando nuevo worker`)
        cluster.fork()
    })
}else
{
const PORT = config.PORT;
let io;
const app = express();

const usuariosRouter=new UsuariosRouter()
const productosRouter=new ProductosRouter()

const options = {
  definition: {
      openapi: "3.0.0",
      info: {
          title: "Mi Ecommerce",
          version: "1.0.0",
          description: "Documentación del proyecto Mi Ecommerce"
      },
  },
  apis: ["./src/docs/*.yaml"]
}
const spec = swaggerJsdoc(options)

app.use(middLogg)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine("handlebars", engine({
  runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
 },
}))
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

initPassport()
app.use(passport.initialize())

app.use(cookieParser("CoderCoder123"))

app.use("/", vistasRouter)
app.use("/", testLogs)
app.use("/api/mock", mockingRouter);
app.use("/api/usuarios", usuariosRouter.getRouter())
app.use("/api/productos", productosRouter.getRouter())
app.use("/api/carritos", carritosRouter)
app.use("/api/sessions", sessionsRouter)
app.use("/", mailRouter)
app.use("/api", pagosRouter)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec))

app.get('/usuario',(req,res)=>{
  let nombre=faker.person.firstName()
  let apellido=faker.person.lastName()
  let email=faker.internet.email({firstName:nombre, lastName:apellido})
  let edad=faker.number.int({min:18, max:70})
  let password=faker.internet.password({length:6, memorable:true})

  let usuario={nombre, apellido, email, edad, password}

  console.log(`Se generó el usuario ${nombre} ${apellido}, con email: ${email}`)
  res.setHeader('Content-Type','application/json');
  return res.status(200).json({usuario});
})

app.post("/pagar", async (req, res) => {
  const ticket = await Ticket.findOne().sort({ created_at: -1 });
const importe = ticket.amount
  
  if(importe<1 || isNaN(importe)){
      res.setHeader('Content-Type','application/json');
      return res.status(400).json({error:`Importe inválido`})
  }
  const preference = new Preference(client);

  let resultado=await preference.create({
      body: {
        items: [
          {
            id: ticket.code,
            title: 'PRODUCTO_PRUEBA',
            quantity: 1,
            unit_price: importe
          }
        ],
          back_urls: {
              "success": "http://localhost:8080/feedback",
              "failure": "http://localhost:8080/feedback",
              "pending": "http://localhost:8080/feedback"
          },
          auto_return: "approved",
      }
  });

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({id:resultado.id});
})

app.get('/feedback', function (req, res) {
  
res.json({
  Payment: req.query.payment_id,
  Status: req.query.status,
  MerchantOrder: req.query.merchant_order_id
});
});

const server = app.listen(PORT, () => {
  //console.log(`Server escuchando en puerto ${PORT}`);
  logger.info(`Server escuchando en puerto ${PORT} - pid: ${process.pid} - worker n°: ${cluster.worker.id}`)
});

let mensajes=[]
let usuarios=[]

  io = new Server(server);

  let cManager=new ChatManager()
  io.on('connection', (socket) => {
    logger.info(`Cliente Conectado con el id ${socket.id}`)
    socket.emit('saludo', { emisor: 'server', mensaje: 'Bienvenido al server' });

    socket.on('confirmacion', nombre => {
  usuarios.push({id:socket.id, nombre})
  socket.emit("historial", mensajes)
      socket.broadcast.emit("nuevoUsuario", nombre)
    });
    socket.on("mensaje", (nombre, mensaje) => {
      cManager.guardarMensaje(nombre, mensaje)
      .then(mensajeGuardado => {
        logger.info('Mensaje guardado exitosamente:', mensajeGuardado )
      })
      .catch(error => {
        logger.info('Error al guardar el mensaje:', error)
      });
      io.emit("nuevoMensaje", nombre, mensaje)
    });
    
  socket.on("disconnect", ()=>{
    let usuario=usuarios.find(u=>u.id===socket.id)
    if(usuario){
        socket.broadcast.emit("saleUsuario", usuario.nombre)
    }
  })
  socket.on("connection", socket=>{
    logger.info(`Se conecto un cliente con id ${socket.id}`)
  });
  })
}