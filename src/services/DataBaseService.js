const DatabaseConfig = require('../config/database');
const logger = require('../utils/logger');

class DatabaseService {

    constructor() {
        this.db = new DatabaseConfig();
    }

    async init() {
        await this.db.connect();
        await this.db.createTables();
    }

    async upsertEmpresa(cnpj, nome) {
        try {
            // Verifica se empresa existe
            const existing = await this.db.get(
                'SELECT id FROM empresas WHERE cnpj = ?', 
                [cnpj]
            );

            if (existing) {
                // Atualiza empresa existente
                await this.db.run(
                    'UPDATE empresas SET nome = ?, updated_at = CURRENT_TIMESTAMP WHERE cnpj = ?',
                    [nome, cnpj]
                );
                return existing.id;

            } else {
                // Insere nova empresa
                const result = await this.db.run(
                    'INSERT INTO empresas (cnpj, nome) VALUES (?, ?)',
                    [cnpj, nome]
                );
                return result.id;
            }

        } catch (error) {
            logger.error('Erro ao upsert empresa:', error);
            throw error;
        }
    }

    async upsertCentroCusto(identificador, nome) {
        try {
            const existing = await this.db.get(
                'SELECT id FROM centros_custo WHERE identificador = ?', 
                [identificador]
            );

            if (existing) {
                await this.db.run(
                    'UPDATE centros_custo SET nome = ?, updated_at = CURRENT_TIMESTAMP WHERE identificador = ?',
                    [nome, identificador]
                );
                return existing.id;

			} else {
                const result = await this.db.run(
                    'INSERT INTO centros_custo (identificador, nome) VALUES (?, ?)',
                    [identificador, nome]
                );
                return result.id;
            }

		} catch (error) {
            logger.error('Erro ao upsert centro de custo:', error);
            throw error;
        }
    }

    async upsertColaborador(colaboradorData) {
        try {
            const existing = await this.db.get(
                'SELECT id FROM colaboradores WHERE cpf = ?', 
                [colaboradorData.cpf]
            );

            if (existing) {
                // Atualiza colaborador existente
                await this.db.run(`
                    UPDATE colaboradores SET 
                        usuario = ?, nome = ?, sobrenome = ?, cargo = ?, 
                        matricula = ?, empresa_id = ?, centro_custo_id = ?,
                        updated_at = CURRENT_TIMESTAMP 
                    WHERE cpf = ?
                `, [
                    colaboradorData.usuario,
                    colaboradorData.nome,
                    colaboradorData.sobrenome,
                    colaboradorData.cargo,
                    colaboradorData.matricula,
                    colaboradorData.empresa_id,
                    colaboradorData.centro_custo_id,
                    colaboradorData.cpf
                ]);
                return { id: existing.id, isNew: false };

            } else {
                // Insere novo colaborador
                const result = await this.db.run(`
                    INSERT INTO colaboradores 
                    (cpf, usuario, nome, sobrenome, cargo, matricula, empresa_id, centro_custo_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    colaboradorData.cpf,
                    colaboradorData.usuario,
                    colaboradorData.nome,
                    colaboradorData.sobrenome,
                    colaboradorData.cargo,
                    colaboradorData.matricula,
                    colaboradorData.empresa_id,
                    colaboradorData.centro_custo_id
                ]);
                return { id: result.id, isNew: true };
            }

        } catch (error) {
            logger.error('Erro ao upsert colaborador:', error);
            throw error;
        }
    }

    async close() {
        this.db.close();
    }
}

module.exports = DatabaseService;