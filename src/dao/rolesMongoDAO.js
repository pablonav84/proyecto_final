import { rolModelo } from "./models/rolModelo.js";

export class RolesManager {
    constructor() {}
  
    async getRolBy(filtro={}) {
      return await rolModelo.findOne(filtro);
    }
    
  }