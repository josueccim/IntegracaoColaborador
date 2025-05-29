const ApiService = require('./ApiService');
const DatabaseService = require('./DatabaseService');
const ReportService = require('./ReportService');
const logger = require('../utils/logger');
const { validateCPF } = require('../utils/validator');

class IntegrationService {
    constructor() {
        this.apiService = new ApiService();
        this.dbService = new DatabaseService();
        this.reportService = new ReportService();
    }

    async init() {
        await this.dbService.init();
    }

    async runIntegration() {
        const report = {
            startTime: new Date(),
            endTime: null,
            processed: 0,
            inserted: 0,
            updated: 0,
            errors: [],
            skipped: 0
        };

        try {
            logger.info('Iniciando processo de integracao');

            // 1. Buscar dados da API
            const colaboradores = await this.apiService.getColaboradores();
            report.processed = colaboradores.length;

            // 2. Processar cada colaborador
            for (const colaborador of colaboradores) {

                try {
                    await this.processColaborador(colaborador, report);

				} catch (error) {
                    report.errors.push({
                        colaborador: colaborador,
                        error: error.message
                    });
                    //logger.error(`Erro ao processar colaborador ${colaborador.cpf}:`, error);
					logger.error(`Erro ao processar colaborador ${colaborador.cpf}:`, error.message);
                }
            }

            report.endTime = new Date();
            
            // 3. Gerar relatorio
            await this.reportService.generateReport(report);
            
            logger.info(`Integracao concluida: ${report.processed} processados, ${report.inserted} inseridos, ${report.updated} atualizados`);

        } catch (error) {
            report.endTime = new Date();
            report.errors.push({ error: error.message });
            
            logger.error('Erro na integracao:', error);
            await this.reportService.generateReport(report);
            
            throw error;
        }

        return report;
    }

    async processColaborador(colaborador, report) {
        // Validacaes
        if (!validateCPF(colaborador.cpf)) {
            report.skipped++;
            throw new Error(`CPF invalido: ${colaborador.cpf}`);
        }

        if (!colaborador.centro_custo_identificador) {
            report.skipped++;
            throw new Error('Colaborador sem centro de custo nao pode ser cadastrado');
        }

        // 1. Processar empresa
        const empresaId = await this.dbService.upsertEmpresa(
            colaborador.empresa_cnpj,
            colaborador.empresa_nome
        );

        // 2. Processar centro de custo
        const centroCustoId = await this.dbService.upsertCentroCusto(
            colaborador.centro_custo_identificador,
            colaborador.centro_custo_nome
        );

        // 3. Processar colaborador
        const colaboradorData = {
            cpf: colaborador.cpf,
            usuario: colaborador.usuario,
            nome: colaborador.nome,
            sobrenome: colaborador.sobrenome,
            cargo: colaborador.cargo,
            matricula: colaborador.matricula,
            empresa_id: empresaId,
            centro_custo_id: centroCustoId
        };

        const result = await this.dbService.upsertColaborador(colaboradorData);
        
        if (result.isNew) {
            report.inserted++;
        } else {
            report.updated++;
        }
    }

    async close() {
        await this.dbService.close();
    }
}

module.exports = IntegrationService;
