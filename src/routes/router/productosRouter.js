import ProductosController from "../../controller/productos.controller.js";
import { ProductsManager } from "../../dao/productosMongoDAO.js";
import { auth } from "../../middleware/auth.js";
import { passportCall } from "../../utils.js";
import { CustomRouter } from "./router.js";

export class ProductosRouter extends CustomRouter{
    init(){
        this.get("/", passportCall("jwt"), auth(["usuario", "admin", "premium"]), ProductosController.getProductos)
        this.get("/:id", passportCall("jwt"), auth(["usuario", "admin", "premium"]), ProductosController.getProductoById)
        this.post("/", passportCall("jwt"), auth(["admin", "premium"]), ProductosController.newProducto);
        this.post("/:id", passportCall("jwt"), auth(["admin", "premium"]), ProductosController.updateProducto);
        this.delete("/:id", passportCall("jwt"), auth(["admin", "premium"]), ProductosController.deleteProducto);
    }
}