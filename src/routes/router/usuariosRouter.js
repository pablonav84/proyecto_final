import { Router } from 'express';
import UsuariosController from '../../controller/usuariosController.js';
import { CustomRouter } from './router.js';
import { uploadDocuments, uploadProfile } from '../../utils.js';

export const router=Router()


export class UsuariosRouter extends CustomRouter{
    init(){
        this.get('/', UsuariosController.getUsuarios)
        this.get("/dto", UsuariosController.getUsuariosDTO)
        this.get("/:id", UsuariosController.getUsuarioById)
        this.post("/", UsuariosController.create)
        this.put("/premium/:uid", UsuariosController.premium)
        this.post("/:uid/profiles", uploadProfile, UsuariosController.profiles)
        this.post("/:uid/documents", uploadDocuments, UsuariosController.documents)
    }
}