import { Router } from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";
import Ticket from "../dao/models/ticketModelo.js";
import { enviarMail } from "../mails.js";

export const router = Router();
const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-3297332412137299-071809-dcf360822902bfbdb82289bde3bc2ba4-1905396539",
});

router.post("/pagar", async (req, res) => {
  const ticket = await Ticket.findOne().sort({ created_at: -1 });
  const importe = ticket.amount;

  const preference = new Preference(client);

  let resultado = await preference.create({
    body: {
      items: [
        {
          id: ticket.code,
          title: "PRODUCTO_PRUEBA",
          quantity: 1,
          unit_price: importe,
        },
      ],
      back_urls: {
        success: "http://localhost:8080/feedback",
        failure: "http://localhost:8080/feedback",
        pending: "http://localhost:8080/feedback",
      },
      auto_return: "approved",
    },
  });
  
  const items = ticket.items.map(
    (item) => `${item.description}:
  Cantidad: ${item.cantidad},
  Precio: ${item.price}`
  );
  let mensaje = `Gracias por su compra...!!! <br>
- Aquí podrá ver los detalles de su compra - <br>
Fecha: <b>${ticket.created_at}</b><br>
Productos:<br>${items.join("<br>")}<br>
Importe a pagar: <b><i>$ ${ticket.amount}</b></i><br>
Por favor continúe los pasos para realizar el pago<br>
Por reclamos o consultas Contáctese a: pagos@miecommerce.com
<br><br>`;

  enviarMail(ticket.purchaser, "Compra realizada con éxito...!!!", mensaje);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ id: resultado.id });
});

router.get("/feedback", function (req, res) {
  res.json({
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id,
  });
});
