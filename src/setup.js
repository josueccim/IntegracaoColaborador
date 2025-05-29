import fs from 'fs/promises';
import path from 'path';
import DatabaseConfig from './config/database.js';

async function setup() {
    console.log(' Configurando ambiente...');

    try {
        // 1. Criar diretorios necessarios
        const dirs = ['database', 'logs', 'reports'];
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
            console.log(`? Diretorio criado: ${dir}/`);
        }

        // 2. Configurar banco de dados
        console.log(' Configurando banco de dados...');
        const db = new DatabaseConfig();
        await db.connect();
        await db.createTables();
        db.close();
        console.log(' Banco de dados configurado');

        // 3. Criar arquivos de exemplo
        const configExample = {
            api: {
                baseURL: 'https://dataprovider.paytrack.com.br',
                timeout: 30000,
                retries: 3
            },
            integration: {
                intervalMinutes: 15,
                logLevel: 'info'
            },
            database: {
                path: './database/paytrack.db'
            }
        };

        await fs.writeFile('config.example.json', JSON.stringify(configExample, null, 2));
        console.log('? Arquivo de configuração de exemplo criado');

        console.log('\n Setup concluído com sucesso!');
        console.log('\n Próximos passos:');
        console.log('1. npm install');
        console.log('2. npm run start');

    } catch (error) {
        console.error('? Erro no setup:', error);
        process.exit(1);
    }
}

setup();
