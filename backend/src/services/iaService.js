const { Configuration, OpenAIApi } = require('openai');

/**
 * Serviço de Inteligência Artificial
 * Usa OpenAI GPT para classificar documentos contabilísticos automaticamente
 */
class IAService {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️  OPENAI_API_KEY não configurada - Serviço de IA desativado');
            this.isEnabled = false;
            return;
        }

        try {
            const configuration = new Configuration({
                apiKey: process.env.OPENAI_API_KEY,
            });
            this.openai = new OpenAIApi(configuration);
            this.isEnabled = true;
            console.log('✓ Serviço de IA OpenAI inicializado');
        } catch (error) {
            console.error('✗ Erro ao inicializar OpenAI:', error);
            this.isEnabled = false;
        }
    }

    /**
     * Verificar se o serviço está disponível
     */
    checkAvailability() {
        if (!this.isEnabled) {
            throw new Error('Serviço de IA não está disponível. Configure OPENAI_API_KEY.');
        }
    }

    /**
     * Classificar documento contabilístico usando IA
     * @param {string} documentText - Texto extraído do documento
     * @returns {Promise<Object>}
     */
    async classifyDocument(documentText) {
        this.checkAvailability();

        try {
            console.log('🤖 Iniciando classificação com IA...');

            // Limitar tamanho do texto (para economizar tokens)
            const maxLength = 4000;
            const textToAnalyze = documentText.length > maxLength
                ? documentText.substring(0, maxLength) + '...'
                : documentText;

            const prompt = `
Analisa este documento contabilístico angolano e extrai as seguintes informações em formato JSON:

Documento:
${textToAnalyze}

Responde APENAS com JSON válido no seguinte formato (sem markdown):

{
  "tipo_documento": "factura|recibo|extracto|nota_credito|nota_debito|outro",
  "numero_documento": "número do documento",
  "data": "data no formato DD/MM/YYYY",
  "fornecedor_cliente": "nome da entidade",
  "descricao": "descrição breve do produto/serviço",
  "valor_total": valor numérico sem símbolos,
  "moeda": "AOA|USD|EUR|KZ",
  "categoria_sugerida": "código PGC-AO (ex: 611, 632, 712)",
  "tipo_movimento": "entrada|saida",
  "confianca": "alta|media|baixa",
  "observacoes": "informação adicional relevante ou explicação da categoria"
}

Categorias PGC-AO de Angola (Plano Geral de Contabilidade):

ENTRADAS (Classe 7 - Proveitos):
- 711: Mercadorias
- 712: Produtos Agrícolas (Óleo, Torta de Sésamo)
- 714: Feijão Guandu
- 715: Produtos Pecuários (Carnes)
- 7151: Linguiça de Porco
- 7152: Presunto e Bacon
- 7153: Linguiça de Cordeiro
- 716: Laticínios
- 717: Queijos
- 7171: Queijo de Sésamo
- 7172: Queijo de Ovelha
- 718: Mel
- 719: Outros Produtos
- 721: Serviços Agrícolas
- 722: Serviços Técnicos
- 741: Subsídios à Agricultura
- 742: Subsídios à Pecuária
- 781: Juros Obtidos

SAÍDAS (Classe 6 - Custos):
- 611: Matérias-Primas (Sementes, Insumos)
- 613: Combustíveis e Lubrificantes
- 614: Embalagens
- 615: Sal Mineral (para animais)
- 6151: Sal para Processamento
- 616: Medicamentos Veterinários
- 617: Condimentos
- 618: Materiais Diversos
- 621: Subcontratos
- 622: Serviços Especializados (Consultoria, Assessoria)
- 623: Materiais de Pequeno Equipamento
- 624: Água e Fluidos
- 6241: Manutenção e Energia
- 625: Deslocações e Estadias
- 626: Serviços Diversos
- 627: Publicidade e Propaganda
- 628: Seguros
- 631: Remunerações dos Órgãos Sociais
- 632: Remunerações do Pessoal
- 633: Alimentação do Pessoal
- 634: Transportes do Pessoal
- 635: Encargos INSS (Segurança Social)
- 636: Seguros de Acidentes de Trabalho
- 637: Gastos de Acção Social
- 651: Impostos
- 652: Descontos Concedidos
- 681: Juros de Empréstimos

IMPORTANTE:
- Para facturas de compra → tipo_movimento: "saida"
- Para facturas de venda → tipo_movimento: "entrada"
- Analisa o contexto para determinar se é entrada ou saída
- Se incerto, usa confianca: "baixa" ou "media"
`.trim();

            const response = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "És um assistente especializado em contabilidade angolana (PGC-AO). Respondes APENAS com JSON válido, sem markdown ou explicações adicionais."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3, // Baixa temperatura para respostas mais determinísticas
                max_tokens: 500
            });

            const resultText = response.data.choices[0].message.content;

            // Limpar possível markdown
            const cleanText = resultText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            console.log('✓ Classificação IA concluída');

            // Parse do JSON
            const classification = JSON.parse(cleanText);

            // Validar campos obrigatórios
            this.validateClassification(classification);

            return classification;

        } catch (error) {
            console.error('✗ Erro na classificação IA:', error);

            // Se for erro de parse do JSON, retornar classificação padrão
            if (error instanceof SyntaxError) {
                console.error('JSON inválido da OpenAI');
                return this.getDefaultClassification(documentText);
            }

            throw new Error(`Falha ao classificar documento com IA: ${error.message}`);
        }
    }

    /**
     * Validar classificação retornada pela IA
     * @param {Object} classification
     */
    validateClassification(classification) {
        const requiredFields = [
            'tipo_documento',
            'categoria_sugerida',
            'tipo_movimento',
            'confianca'
        ];

        for (const field of requiredFields) {
            if (!classification[field]) {
                console.warn(`⚠️  Campo obrigatório ausente: ${field}`);
            }
        }

        // Validar tipo_movimento
        if (!['entrada', 'saida'].includes(classification.tipo_movimento)) {
            classification.tipo_movimento = 'saida'; // Default
        }

        // Validar confianca
        if (!['alta', 'media', 'baixa'].includes(classification.confianca)) {
            classification.confianca = 'media';
        }
    }

    /**
     * Obter classificação padrão em caso de erro
     * @param {string} text
     * @returns {Object}
     */
    getDefaultClassification(text) {
        console.log('ℹ️  Usando classificação padrão');

        // Tentar extrair informações básicas do texto
        const hasValor = /\d{1,3}([\.,]\d{3})*[\.,]?\d{0,2}/g.test(text);
        const hasData = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g.test(text);

        return {
            tipo_documento: 'outro',
            numero_documento: null,
            data: null,
            fornecedor_cliente: null,
            descricao: 'Documento não classificado automaticamente',
            valor_total: null,
            moeda: 'AOA',
            categoria_sugerida: '618', // Materiais Diversos (categoria genérica)
            tipo_movimento: 'saida',
            confianca: 'baixa',
            observacoes: 'Classificação automática falhou. Revisão manual necessária.'
        };
    }

    /**
     * Sugerir categoria baseada em palavras-chave (fallback sem IA)
     * @param {string} text - Texto do documento
     * @param {string} tipo - tipo de movimento (entrada/saida)
     * @returns {string}
     */
    suggestCategoryByKeywords(text, tipo = 'saida') {
        const textLower = text.toLowerCase();

        if (tipo === 'entrada') {
            // Categorias de proveitos
            if (textLower.includes('óleo') || textLower.includes('sesamo')) return '712';
            if (textLower.includes('mel')) return '718';
            if (textLower.includes('queijo')) return '717';
            if (textLower.includes('carne')) return '715';
            if (textLower.includes('feijão') || textLower.includes('guandu')) return '714';
            if (textLower.includes('serviço')) return '721';
            if (textLower.includes('subsídio')) return '741';
            return '711'; // Mercadorias (genérico)
        } else {
            // Categorias de custos
            if (textLower.includes('combustível') || textLower.includes('gasolina') || textLower.includes('gasóleo')) return '613';
            if (textLower.includes('salário') || textLower.includes('ordenado') || textLower.includes('vencimento')) return '632';
            if (textLower.includes('inss') || textLower.includes('segurança social')) return '635';
            if (textLower.includes('água') || textLower.includes('electricidade') || textLower.includes('luz')) return '624';
            if (textLower.includes('medicamento') || textLower.includes('veterinári')) return '616';
            if (textLower.includes('semente') || textLower.includes('adubo') || textLower.includes('fertilizante')) return '611';
            if (textLower.includes('embalagem') || textLower.includes('caixa') || textLower.includes('saco')) return '614';
            if (textLower.includes('seguro')) return '628';
            if (textLower.includes('imposto') || textLower.includes('taxa')) return '651';
            return '618'; // Materiais Diversos (genérico)
        }
    }

    /**
     * Melhorar classificação existente (segunda passagem)
     * @param {Object} classification - Classificação inicial
     * @param {string} additionalContext - Contexto adicional
     * @returns {Promise<Object>}
     */
    async refineClassification(classification, additionalContext = '') {
        this.checkAvailability();

        try {
            const prompt = `
Revê e melhora esta classificação de documento contabilístico:

Classificação Actual:
${JSON.stringify(classification, null, 2)}

Contexto Adicional:
${additionalContext}

Fornece uma classificação melhorada em JSON, corrigindo qualquer erro e aumentando a confiança se possível.
Responde APENAS com JSON válido.
`.trim();

            const response = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "És um assistente especializado em contabilidade angolana (PGC-AO). Respondes APENAS com JSON válido."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 400
            });

            const resultText = response.data.choices[0].message.content;
            const cleanText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanText);

        } catch (error) {
            console.error('✗ Erro ao refinar classificação:', error);
            // Retornar classificação original se refinamento falhar
            return classification;
        }
    }
}

module.exports = new IAService();
