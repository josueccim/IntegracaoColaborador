require('dotenv').config();

const { default: fetch } = require('node-fetch'); // Import fetch from node-fetch
const logger = require('../utils/logger');

class ApiService {

    constructor() {
        const API_URL = process.env.API_URL;
        const API_AUTH_HEADER = process.env.API_AUTH_HEADER;
        const API_COOKIE = process.env.API_COOKIE;
        
        this.baseURL = API_URL;
        this.headers = {
            'Authorization': API_AUTH_HEADER,
            'Cookie': API_COOKIE
        };
    }

    async getColaboradores(retries = 3) {

        for (let attempt = 1; attempt <= retries; attempt++) {

            try {
                logger.info(`Tentativa ${attempt} de consumir API`);
                
                const response = await fetch(
                    `${this.baseURL}/data?view=view_colaboradores_teste_tecnico`,
                    {
                        method: 'GET',
                        headers: this.headers,
                        timeout: 30000
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                logger.info(`API retornou ${data.length} colaboradores`);

                return data;

            } catch (error) {
                logger.error(`Erro na tentativa ${attempt}:`, error.message);
                logger.error(error);

                if (attempt === retries) {
                    throw new Error(`Falha após ${retries} tentativas: ${error.message}`);
                }
                
                // Aguarda 5 segundos antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}

module.exports = ApiService;
