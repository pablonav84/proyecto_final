import { config } from "./config/config.js"
import nodemailer from "nodemailer"

const transporter=nodemailer.createTransport(
    {
        service: "gmail", 
        port: 587,
        auth: {
            user: "pablonav84@gmail.com",
            pass: "swqbpvgewqenmhel"
        }
    }
)

export const enviarMail=(to, subject, message, attachments)=>{
    return transporter.sendMail(
        {
            from: `Pablo Navarro ${config.EMAIL}`,
            to,
            subject,
            html: message,
            attachments
        }
    )
}

export const recuperoPassword=async(to, subject, message)=>{
    return await transporter.sendMail(
        {
            from:`Proyecto Ecommerce ${config.EMAIL}`,
            to, subject, 
            html: message
        }
    )
}