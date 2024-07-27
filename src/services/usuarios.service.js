import { DAO } from "../dao/factory.js"


class UsuariosService{
    constructor(dao){
        this.dao= new dao()
    }
    async getAllUsuarios(){
        return await this.dao.getAll()
    }
    async getUsersDTO(){
        return await this.dao.getDTO()
    }
    async getUsuarioByEmail(email){
        
        return await this.dao.getBy(email)
    }
    async getUsuarioById(id){
        return await this.dao.getBy(id)
    }
    async getSinLean(id){
        return await this.dao.getBySinLean({_id:id})
    }
    async actualizaUsuario(id, datosActualizados){
        return await this.dao.updateUsuario(id, datosActualizados);
    } 
    async crearUsuario(usuario){
        return await this.dao.create(usuario)
    }
    async updateDocumento(id) {
        const actualizaDocumento = { documento: true };
        return await this.dao.actualizaDocumento(id, actualizaDocumento);
      }
    async updateComprobante(id) {
        const actualizaComprobante = { comprobante: true };
        return await this.dao.actualizaComprobante(id, actualizaComprobante);
      }
    async updateEstadoCuenta(id) {
        const actualizaEstadoCuenta = { estadoCuenta: true };
        return await this.dao.actualizaEstadoCuenta(id, actualizaEstadoCuenta);
      }
}

export const usuariosService=new UsuariosService(DAO)