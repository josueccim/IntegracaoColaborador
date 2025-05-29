# Sistema de Integração Colaborador

Sistema automatizado para integração de dados de colaboradores via API, desenvolvido em Node.js com persistência em SQLite.

## Funcionalidades

- **Consumo de API**: Integração automática com API de colaboradores
- **Persistência Inteligente**: Upsert de dados com relacionamentos
- **Automação**: Execução a cada 15 minutos via cron job
- **Relatórios Detalhados**: Logs estruturados e relatórios sintéticos
- **Validação Robusta**: CPF e regras de negócio
- **Tratamento de Erros**: Retry automático e logging completo

## Arquitetura

```
src/
├── config/          # Configurações (banco, API)
├── services/        # Lógica de negócio
├── utils/           # Utilitários (logger, validator)
├── jobs/            # Agendamentos (cron)
└── app.js          # Aplicação principal
```

## Instalação e Execução

### Pré-requisitos
- Node.js >= 16.0.0
- npm >= 8.0.0

### Setup Inicial

1. **Clone e instale dependências:**
```bash
git clone https://github.com/josueccim/IntegracaoColaborador
cd IntegracaoColaborador
npm install
```

2. **Configure o ambiente:**
```bash
npm run setup
```

3. **Execute a aplicação:**
```bash
# Producao
npm start

# Desenvolvimento (com nodemon)
npm run dev
```

## Monitoramento

### Logs
- `logs/combined.log` - Log geral da aplicação
- `logs/error.log` - Apenas erros
- Console - Output em tempo real

### Relatórios
- `reports/integration-[timestamp].json` - Dados estruturados
- `reports/integration-[timestamp].txt` - Relatório visual

### Exemplo de Relatório:
```
================================================================================
                    RELATÓRIO DE INTEGRAÇÃO PAYTRACK
================================================================================

* Total de Registros Processados: 150
* Registros Inseridos: 25
* Registros Atualizados: 120
* Registros Ignorados: 3
* Erros Encontrados: 2
* Taxa de Sucesso: 98.67%
* Tempo de Execução: 5.43 segundos

STATUS: ✅ SUCESSO
```

## Estrutura do Banco
### Diagrama
<img src="./img/er_diagrama.jpg" alt="Imagem Diagrama ER" />

### Tabelas

**empresas**
- `id` (PK)
- `cnpj` (UNIQUE)
- `nome`
- `created_at`, `updated_at`

**centros_custo**
- `id` (PK)
- `identificador` (UNIQUE)
- `nome`
- `created_at`, `updated_at`

**colaboradores**
- `id` (PK)
- `cpf` (UNIQUE)
- `usuario`, `nome`, `sobrenome`
- `cargo`, `matricula`
- `empresa_id` (FK), `centro_custo_id` (FK)
- `created_at`, `updated_at`

### Relacionamentos
- Colaborador - Empresa (N:1)
- Colaborador - Centro de Custo (N:1)

## Configuração

### Variáveis de Ambiente
```bash
NODE_ENV=production
LOG_LEVEL=info
DB_PATH=./database/paytrack.db
```

### Arquivo de Configuração (config.json)
```json
{
  "api": {
    "baseURL": "https://dataprovider.paytrack.com.br",
    "timeout": 30000,
    "retries": 3
  },
  "integration": {
    "intervalMinutes": 15,
    "logLevel": "info"
  }
}
```

## Validação

### Validações Implementadas:
- ✅ CPF obrigatório e válido
- ✅ Centro de custo obrigatório
- ✅ Dados de empresa obrigatórios
- ✅ Tratamento de duplicatas

### Cenários de Teste:
- ✅ Inserção de novos colaboradores
- ✅ Atualização de colaboradores existentes
- ✅ Mudança de empresa/centro de custo
- ✅ Tratamento de dados inválidos
- ✅ Falha de conectividade com API
- ✅ Recuperação de erros

## Tratamento de Erros

### Estratégias Implementadas:
- **Retry Automático**: 3 tentativas com delay
- **Timeout**: 30 segundos por requisição
- **Logging Estruturado**: Winston com níveis
- **Graceful Shutdown**: Encerramento limpo
- **Validação de Dados**: Pré-processamento

### Códigos de Erro Comuns:
- `HTTP 401`: Problema de autenticação
- `HTTP 500`: Erro no servidor da API
- `TIMEOUT`: Conexão lenta/instável
- `CPF_INVALID`: CPF inválido ou ausente
- `NO_COST_CENTER`: Centro de custo obrigatório

## Melhorias Futuras

### Propostas de Extensão:

**Performance:**
- Cache Redis para consultas frequentes
- Processamento paralelo

**Monitoramento:**
- Dashboard web em tempo real
- Alertas via email

**Funcionalidades:**
- API REST para consultas/logs/relatorios
- Exportação de relatórios (PDF/Excel)
- Histórico de mudanças

## Desenvolvimento
- Teste Unitários e de integração
  
### Scripts Disponíveis:
```bash
npm start      # Execução em produção
npm run dev    # Desenvolvimento com hot-reload
npm run setup  # Configuração inicial
```

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `logs/`
2. Consulte os relatórios em `reports/`
3. Analise a conectividade com a API
4. Verifique permissões de arquivo/diretório

---

**Desenvolvido por Josué**
