import mongoose from "mongoose";


const rolSchema = new mongoose.Schema({
    descrip: {
        type: String,
        enum: ["usuario", "admin", "premium"]
    }
}, { timestamps: true, collection: "roles" });

export const rolModelo = mongoose.model("roles", rolSchema);