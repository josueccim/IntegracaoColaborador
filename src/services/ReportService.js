import fs from 'fs/promises';
import logger from '../utils/logger.js';

import path from 'path';
import { fileURLToPath } from 'url'; // Para obter o caminho do arquivo atual
import { dirname } from 'path'; 

//__filename e __dirname para ES Modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ReportService {
    constructor() {
        this.reportsDir = path.join(__dirname, '../../reports');
        this.ensureReportsDir();
    }

    async ensureReportsDir() {
        try {
            await fs.mkdir(this.reportsDir, { recursive: true });
        } catch (error) {
            logger.error('Erro ao criar diretório de relatórios:', error);
        }
    }

    async generateReport(reportData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportId = `integration-${timestamp}`;

        try {
            // 1. Relat�rio JSON estruturado
            await this.generateJSONReport(reportId, reportData);
            
            // 2. Relat�rio humanamente leg�vel
            await this.generateTextReport(reportId, reportData);
            
            // 3. Log do relat�rio
            this.logReport(reportData);
            
            logger.info(`Relatórios gerados: ${reportId}`);
            
        } catch (error) {
            logger.error('Erro ao gerar relatórios:', error);
            throw error;
        }
    }

    async generateJSONReport(reportId, data) {
        const reportPath = path.join(this.reportsDir, `${reportId}.json`);
        
        const report = {
            id: reportId,
            timestamp: new Date().toISOString(),
            execution: {
                startTime: data.startTime,
                endTime: data.endTime,
                duration: data.endTime ? 
                    `${((data.endTime - data.startTime) / 1000).toFixed(2)}s` : null
            },
            summary: {
                processed: data.processed,
                inserted: data.inserted,
                updated: data.updated,
                skipped: data.skipped || 0,
                errors: data.errors.length
            },
            details: {
                successRate: data.processed > 0 ? 
                    `${(((data.processed - data.errors.length) / data.processed) * 100).toFixed(2)}%` : '0%',
                errors: data.errors
            }
        };

        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    }

    async generateTextReport(reportId, data) {
        const reportPath = path.join(this.reportsDir, `${reportId}.txt`);
        
        const duration = data.endTime ? 
            ((data.endTime - data.startTime) / 1000).toFixed(2) : 'N/A';
        
        const successRate = data.processed > 0 ? 
            (((data.processed - data.errors.length) / data.processed) * 100).toFixed(2) : 0;

        let content = `
================================================================================
                    RELATÓRIO DE INTEGRAÇÃO PAYTRACK
================================================================================

ID do Relatório: ${reportId}
Data/Hora: ${new Date().toLocaleString('pt-BR')}

RESUMO EXECUTIVO:
--------------------------------------------------------------------------------
� Total de Registros Processados: ${data.processed}
� Registros Inseridos: ${data.inserted}
� Registros Atualizados: ${data.updated}
� Registros Ignorados: ${data.skipped || 0}
� Erros Encontrados: ${data.errors.length}
� Taxa de Sucesso: ${successRate}%
� Tempo de Execução: ${duration} segundos

DETALHES DA EXECUÇÃO:
--------------------------------------------------------------------------------
Início: ${data.startTime ? data.startTime.toLocaleString('pt-BR') : 'N/A'}
Fim: ${data.endTime ? data.endTime.toLocaleString('pt-BR') : 'N/A'}

STATUS: ${data.errors.length === 0 ? '? SUCESSO' : '?? SUCESSO COM ALERTAS'}
`;

        if (data.errors.length > 0) {
            content += `
ERROS E INCONSISTÊNCIAS:
--------------------------------------------------------------------------------
`;
            data.errors.forEach((error, index) => {
                content += `
${index + 1}. ${error.error}
`;
                if (error.colaborador) {
                    content += `   CPF: ${error.colaborador.cpf || 'N/A'}
   Nome: ${error.colaborador.nome || 'N/A'} ${error.colaborador.sobrenome || ''}
   Empresa: ${error.colaborador.empresa_nome || 'N/A'}
`;
                }
            });
        }

        content += `
================================================================================
Relatório gerado automaticamente pelo Sistema de Integração Paytrack
================================================================================
`;

        await fs.writeFile(reportPath, content);
    }

    logReport(data) {
        const summary = {
            processed: data.processed,
            inserted: data.inserted,
            updated: data.updated,
            skipped: data.skipped || 0,
            errors: data.errors.length,
            duration: data.endTime ? 
                `${((data.endTime - data.startTime) / 1000).toFixed(2)}s` : null
        };

        if (data.errors.length === 0) {
            logger.info('Integração concluída com sucesso', summary);
        } else {
            logger.warn('Integração concluída com alertas', summary);
        }
    }

    async getLatestReports(limit = 10) {
        try {
            const files = await fs.readdir(this.reportsDir);
            const jsonFiles = files
                .filter(file => file.endsWith('.json'))
                .sort()
                .reverse()
                .slice(0, limit);

            const reports = [];
            for (const file of jsonFiles) {
                const content = await fs.readFile(
                    path.join(this.reportsDir, file), 
                    'utf8'
                );
                reports.push(JSON.parse(content));
            }

            return reports;
        } catch (error) {
            logger.error('Erro ao buscar relatórios:', error);
            return [];
        }
    }
}

export default ReportService;
