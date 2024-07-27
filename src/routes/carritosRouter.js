import { Router } from "express";
import { passportCall } from "../utils.js";
import CarritosController from "../controller/carritosController.js";
export const router = Router();


router.get("/:cid", CarritosController.getCart);
router.put("/:cid/producto/:pid", passportCall("jwt"), CarritosController.getProductToCart);
router.put("/:cid/purchase", passportCall("jwt"), CarritosController.purchase);
router.delete("/delete/:cid/:pid", passportCall("jwt"), CarritosController.deleteProduct);