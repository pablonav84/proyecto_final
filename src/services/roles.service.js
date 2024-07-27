import { RolesManager as RolesDAO } from "../dao/rolesMongoDAO.js"

class RolesService{
    constructor(dao){
        this.RolesDAO=dao
    }
    async getRol(id){
        
        return await this.RolesDAO.getRolBy(id)
    }
}

export const rolesService=new RolesService(new RolesDAO())