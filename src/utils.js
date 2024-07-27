import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from "bcrypt"
import passport from "passport"
import multer from "multer"
import winston from "winston"
import { config } from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const SECRET="CoderCoder123"

export const generaHash=password=>bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const passportCall=(estrategia)=>{
    return function(req, res, next) {
        passport.authenticate(estrategia, function(err, user, info, status) {
          if (err) { return next(err) }
          if (!user) {
            res.setHeader('Content-Type','application/json');
            return res.status(401).json({
                error: info.message?info.message:info.toString()
            })
          }
        req.user=user
        return next()
        })(req, res, next);
      }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
export const upload = multer({ storage: storage })


const storageDocuments = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/uploads/documents')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
export const uploadDocuments = multer({ storage: storageDocuments }).fields([
  { name: 'documento' },
  { name: 'comprobante' },
  { name: 'estadoCuenta' },
]);


const storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    let destinationFolder = '';

    if (file.fieldname === 'perfil') {
      destinationFolder = './src/uploads/profiles';
    } else if (file.fieldname === 'producto') {
      destinationFolder = './src/uploads/products';
    }

    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
export const uploadProfile = multer({
  storage: storageProfile,
}).fields([
  { name: 'perfil' },
  { name: 'producto' },
]);


const customLevels={
    fatal:0,
    error:1,
    warning:2,
    info:3,
    http:4,
    debug:5
}

export const logger = winston.createLogger({
    levels: customLevels,
    transports: [
      new winston.transports.Console({
        level: config.MODE === 'development' ? 'debug' : 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize({
            colors:{fatal:"red", error: "red", warning:"yellow", info:"blue", http: "green", debug:"white"}
        }),
          winston.format.simple()
        )
      })
    ]
  });

const transporteFile=new winston.transports.File({
    level: "error",
    filename: "./src/logs/error.log",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    )
})

if(config.MODE=="production"){
    logger.add(transporteFile)
}

export const middLogg=(req, res, next)=>{
    req.logger=logger
    next()
}