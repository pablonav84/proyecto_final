import ProductosController from "../../controller/productos.controller.js";
import { ProductsManager } from "../../dao/productosMongoDAO.js";
import { auth } from "../../middleware/auth.js";
import { passportCall } from "../../utils.js";
import { CustomRouter } from "./router.js";

const productsManager=new ProductsManager()

export class ProductosRouter extends CustomRouter{
    init(){
        this.get("/", passportCall("jwt"), auth(["usuario", "admin", "premium"]), ProductosController.getProductos)
        this.get("/:id", passportCall("jwt"), auth(["usuario", "admin", "premium"]), ProductosController.getProductoById)
        this.post("/", passportCall("jwt"), auth(["usuario", "admin", "premium"]), ProductosController.newProducto);
        this.put("/:id", passportCall("jwt"), auth(["usuario", "admin", "premium"]), ProductosController.updateProducto);
        this.delete("/:id", passportCall("jwt"), auth(["usuario", "admin", "premium"]), ProductosController.deleteProducto);
    }
}
