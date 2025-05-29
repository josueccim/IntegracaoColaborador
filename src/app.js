import IntegrationService from './services/IntegrationService.js';
import cron from 'node-cron';
import logger from './utils/logger.js'

class App {
    constructor() {
        this.integrationService = new IntegrationService();
    }

    async init() {
        try {
            await this.integrationService.init();
            logger.info('Aplicação inicializada com sucesso');
            
            // Executa uma vez no inicio
            await this.runIntegration();
            
            // Agenda execucao a cada 15 minutos
            this.scheduleIntegration();
            
        } catch (error) {
            logger.error('Erro na inicialização:', error);
            process.exit(1);
        }
    }

    async runIntegration() {
        try {
            await this.integrationService.runIntegration();
        } catch (error) {
            logger.error('Erro na integração:', error);
        }
    }

    scheduleIntegration() {
        // Executa a cada 15 minutos
        cron.schedule('*/15 * * * *', async () => {
            logger.info('Executando integra��o agendada...');
            await this.runIntegration();
        });
        
        logger.info('Agendamento configurado: execução a cada 15 minutos');
    }

    async shutdown() {
        logger.info('Encerrando aplicação...');
        await this.integrationService.close();
        process.exit(0);
    }
}

// Tratamento de sinais de encerramento
const app = new App();

process.on('SIGINT', () => app.shutdown());
process.on('SIGTERM', () => app.shutdown());

// Inicializa aplicação
app.init().catch(error => {
    logger.error('Erro fatal:', error);
    process.exit(1);
});

export default App;