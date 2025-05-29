

describe('ApiService', () => {
  let ApiService;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.API_URL = 'http://fakeapi.com';
    process.env.API_AUTH_HEADER = 'Bearer token';
    process.env.API_COOKIE = 'cookie=123';
    global.fetch = jest.fn();

    // Mock do logger antes de importar a classe
    jest.unstable_mockModule('../src/utils/logger.js', () => ({
      default: {
        info: jest.fn(),
        error: jest.fn(),
      }
    }));

    // Importe dinâmico após o mock
    ApiService = (await import('../src/services/ApiService.js')).default;
  });

  afterEach(() => {
    process.env = OLD_ENV;
    jest.clearAllMocks();
  });

  it('deve retornar colaboradores em caso de sucesso', async () => {
    const fakeData = [{ nome: 'João' }, { nome: 'Maria' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeData,
      status: 200,
      statusText: 'OK',
    });

    const apiService = new ApiService();
    const result = await apiService.getColaboradores();

    expect(fetch).toHaveBeenCalledWith(
      'http://fakeapi.com/data?view=view_colaboradores_teste_tecnico',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Bearer token',
          Cookie: 'cookie=123',
        },
        timeout: 30000,
      })
    );
    expect(result).toEqual(fakeData);
  });

  it('deve tentar novamente em caso de erro e lançar após 3 tentativas', async () => {
    fetch.mockRejectedValue(new Error('Falha de rede'));

    const apiService = new ApiService();

    await expect(apiService.getColaboradores(2)).rejects.toThrow('Falha após 2 tentativas: Falha de rede');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('deve lançar erro se response.ok for falso', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Erro Interno',
      json: async () => ({}),
    });

    const apiService = new ApiService();

    await expect(apiService.getColaboradores(1)).rejects.toThrow('Falha após 1 tentativas: HTTP 500: Erro Interno');
  });
}); 