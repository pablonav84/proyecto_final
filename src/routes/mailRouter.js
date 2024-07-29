import { Router } from "express";
import { upload } from "../utils.js";
import MailController from "../controller/mailController.js";

export const router = Router();

router.post("/mail", upload.array("imagenes"), MailController.enviarMail);