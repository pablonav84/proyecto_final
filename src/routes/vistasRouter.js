import { Router } from 'express';
import { passportCall } from '../utils.js';
import { auth } from '../middleware/auth.js';
import { rolModelo } from '../dao/models/rolModelo.js';
import { productsModelo } from '../dao/models/productosModelo.js';
import { UsuariosDTO } from '../DTO/usuariosDTO.js';
import { CarritosDAO } from '../dao/carritosDAO.js';
import Ticket from '../dao/models/ticketModelo.js';

export const router = Router();

let carritosDAO = new CarritosDAO()

router.get('/', (req, res) => {
  res.status(200).render('login');
})

router.get('/chat', passportCall("jwt"), auth(["usuario"]), async (req, res) => {
    
  res.setHeader("Content-Type", "text/html");
  res.status(200).render('chat');
})

router.get('/vistaMail', (req, res) => {
  res.status(200).render('vistaMail');
})

router.get('/home', passportCall("jwt", {session:false}), async (req,res)=>{
  try {
    let usuario=req.user;
  const usuarioDTO = new UsuariosDTO(usuario);
    const rol = await rolModelo.findById(req.user.rol); 

    res.status(200).render('home', {usuario, usuarioDTO, rol});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al cargar la página de inicio' });
  }
});


router.get("/productos", passportCall("jwt", {session:false}), async (req, res) => {
  
  let usuario=req.user;
  const usuarioDTO = new UsuariosDTO(usuario);
  let { pagina, limit, sort } = req.query;
  if (!pagina) {
    pagina = 1;
  }
  let sortOption = {}; // Inicializa un objeto vacío para las opciones de ordenamiento
  if (sort) {
    // Verifica si se proporciona el parámetro 'sort'
    if (sort === "asc") {
      sortOption = {
        /* Define los criterios de ordenamiento para el orden ascendente */
      };
    } else if (sort === "desc") {
      sortOption = {
        /* Define los criterios de ordenamiento para el orden descendente */
      };
    }
  }
  let {
    docs: productos,
    totalPages,
    prevPage,
    nextPage,
    hasPrevPage,
    hasNextPage,
  } = await productsModelo.paginate(
    {},
    { limit: limit || 10, page: pagina, lean: true, sort: sortOption }
  );
  res.setHeader("Content-Type", "text/html");
  return res
    .status(200)
    .render("productos", {
      productos,
      usuario,
      usuarioDTO,
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
    });
});

router.get("/editproduct", async (req, res) => {
  
  let { pagina, limit, sort } = req.query;
  if (!pagina) {
    pagina = 1;
  }
  let sortOption = {};
  if (sort) {
    
    if (sort === "asc") {
      sortOption = {
      };
    } else if (sort === "desc") {
      sortOption = {
      };
    }
  }
  let {
    docs: productos,
    totalPages,
    prevPage,
    nextPage,
    hasPrevPage,
    hasNextPage,
  } = await productsModelo.paginate(
    {},
    { limit: limit || 10, page: pagina, lean: true, sort: sortOption }
  );
  res.setHeader("Content-Type", "text/html");
  return res
    .status(200)
    .render("editarproduct", {
      productos,
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
    });
});

router.get("/nuevoproducto", (req, res) => {

  return res.status(200).render("nuevoproducto");
})

router.get("/updateproduct/:id", async (req, res) => {
  let id = req.params.id;
  let producto = await productsModelo.findById(id);

  return res.status(200).render("updateproduct", producto);
})

router.get("/productos/:id", passportCall("jwt", {session:false}), async (req, res) => {

  let usuario=req.user;
  const usuarioDTO = new UsuariosDTO(usuario);
  let id = req.params.id;
  let product = await productsModelo.findById(id);

  res.setHeader("Content-Type", "text/html");
  return res.status(200).render("detailProducts", { product, usuario, usuarioDTO });
});

router.get("/registro", (req, res) => {

  return res.status(200).render("registro");
})

router.get('/carrito', passportCall("jwt"),async(req, res) => {

  let usuario=req.user
  let carrito=await carritosDAO.getOneByPopulate({_id:usuario.cart._id})

  res.status(200).render('carrito', {usuario: req.user, carrito});
})

router.get('/documentos', passportCall("jwt", {session:false}), (req, res) => {
  let usuario=req.user;

  res.status(200).render('documentos', usuario);
})

router.get('/pago', async (req, res) => {
  const ticket = await Ticket.findOne().sort({ created_at: -1 });
  
  res.status(200).render('pago', {ticket});
})