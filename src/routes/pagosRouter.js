import { Router } from "express";
import PagosController from "../controller/pagosController.js";

export const router = Router();

router.post("/pagar", PagosController.pago)