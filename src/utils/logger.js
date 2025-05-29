import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url'; // Para obter o caminho do arquivo atual
import { dirname } from 'path'; 

//__filename e __dirname para ES Modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(

    // 1. Adiciona o carimbo de data/hora
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
    
    // 2. Define o formato da mensagem final
    winston.format.printf(info => { 
        if (info.stack) {
            return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}\n${info.stack}`;
        }
        return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
    })
    ),
    defaultMeta: { service: 'paytrack-integration' },

	transports: [
        new winston.transports.File({ 
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error' 
        }),

		new winston.transports.File({ 
            filename: path.join(__dirname, '../../logs/combined.log') 
        }),

		new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

//module.exports = logger;
export default logger;