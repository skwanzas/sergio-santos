const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Serviço de OCR (Optical Character Recognition)
 * Extrai texto de imagens e PDFs usando Tesseract.js
 */
class OCRService {
    /**
     * Extrair texto de imagem usando Tesseract
     * @param {string} filePath - Caminho do ficheiro de imagem
     * @returns {Promise<{text: string, confidence: number}>}
     */
    async extractFromImage(filePath) {
        try {
            console.log('🔄 Iniciando OCR do ficheiro:', filePath);

            // Verificar se o ficheiro existe
            try {
                await fs.access(filePath);
            } catch (error) {
                throw new Error(`Ficheiro não encontrado: ${filePath}`);
            }

            // Executar OCR com Tesseract
            const result = await Tesseract.recognize(
                filePath,
                'por', // Língua: Português
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                }
            );

            console.log('✓ OCR concluído com sucesso');
            console.log(`📝 Confiança: ${result.data.confidence.toFixed(2)}%`);

            return {
                text: result.data.text,
                confidence: result.data.confidence,
                words: result.data.words ? result.data.words.length : 0
            };

        } catch (error) {
            console.error('✗ Erro no OCR:', error);
            throw new Error(`Falha ao extrair texto do documento: ${error.message}`);
        }
    }

    /**
     * Extrair texto de PDF
     * @param {string} filePath - Caminho do ficheiro PDF
     * @returns {Promise<{text: string, pages: number, confidence: number}>}
     */
    async extractFromPDF(filePath) {
        try {
            console.log('🔄 Iniciando extração de PDF:', filePath);

            // Importar dinamicamente o pdf-parse
            const pdfParse = require('pdf-parse');

            // Ler o ficheiro PDF
            const dataBuffer = await fs.readFile(filePath);

            // Extrair texto
            const data = await pdfParse(dataBuffer);

            console.log('✓ PDF extraído com sucesso');
            console.log(`📄 Páginas: ${data.numpages}`);

            return {
                text: data.text,
                pages: data.numpages,
                confidence: 95 // PDFs geralmente têm alta confiança
            };

        } catch (error) {
            console.error('✗ Erro ao extrair PDF:', error);

            // Se pdf-parse falhar, tentar converter PDF para imagem e usar OCR
            // (implementação simplificada - em produção, usar pdf2image)
            throw new Error(`Falha ao extrair texto do PDF: ${error.message}`);
        }
    }

    /**
     * Processar documento (detecta automaticamente o tipo)
     * @param {string} filePath - Caminho do ficheiro
     * @returns {Promise<{text: string, confidence: number, type: string}>}
     */
    async processDocument(filePath) {
        try {
            const ext = path.extname(filePath).toLowerCase();

            let result;
            let type;

            switch (ext) {
                case '.pdf':
                    result = await this.extractFromPDF(filePath);
                    type = 'pdf';
                    break;

                case '.jpg':
                case '.jpeg':
                case '.png':
                case '.bmp':
                case '.tiff':
                case '.tif':
                    result = await this.extractFromImage(filePath);
                    type = 'image';
                    break;

                default:
                    throw new Error(`Tipo de ficheiro não suportado: ${ext}`);
            }

            return {
                ...result,
                type,
                processedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('✗ Erro ao processar documento:', error);
            throw error;
        }
    }

    /**
     * Limpar texto extraído (remover caracteres indesejados)
     * @param {string} text - Texto extraído
     * @returns {string}
     */
    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n') // Normalizar quebras de linha
            .replace(/\n{3,}/g, '\n\n') // Reduzir múltiplas quebras de linha
            .replace(/\s{2,}/g, ' ') // Reduzir múltiplos espaços
            .trim();
    }

    /**
     * Extrair informações específicas do texto (números, datas, etc.)
     * @param {string} text - Texto extraído
     * @returns {Object}
     */
    extractInfo(text) {
        const info = {
            numbers: [],
            dates: [],
            amounts: []
        };

        // Extrair números de factura (vários formatos)
        const invoicePatterns = [
            /(?:factura|invoice|fatura)[\s#:nº]*([A-Z0-9\-\/]+)/gi,
            /n[úº][\s]*([0-9]+)/gi
        ];

        invoicePatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                info.numbers.push(match[1].trim());
            }
        });

        // Extrair datas (formato DD/MM/YYYY ou DD-MM-YYYY)
        const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
        const dateMatches = text.matchAll(datePattern);
        for (const match of dateMatches) {
            info.dates.push(match[1]);
        }

        // Extrair valores monetários (Kz, AOA, $, etc.)
        const amountPatterns = [
            /(?:kz|aoa|kwanza)[\s]*([0-9.,]+)/gi,
            /([0-9.,]+)[\s]*(?:kz|aoa|kwanza)/gi,
            /total:[\s]*([0-9.,]+)/gi
        ];

        amountPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const amount = match[1].replace(/[.,]/g, '');
                if (amount.length >= 2) { // Filtrar valores muito pequenos
                    info.amounts.push(match[1]);
                }
            }
        });

        return info;
    }

    /**
     * Validar qualidade do OCR
     * @param {number} confidence - Confiança do OCR (0-100)
     * @param {string} text - Texto extraído
     * @returns {{isValid: boolean, quality: string, recommendations: string[]}}
     */
    validateQuality(confidence, text) {
        const recommendations = [];
        let quality;

        if (confidence >= 90) {
            quality = 'excelente';
        } else if (confidence >= 75) {
            quality = 'boa';
        } else if (confidence >= 60) {
            quality = 'aceitável';
            recommendations.push('Considere melhorar a qualidade da imagem');
        } else {
            quality = 'baixa';
            recommendations.push('Qualidade muito baixa - recomendado refazer o scan');
            recommendations.push('Certifique-se que a imagem está nítida e bem iluminada');
        }

        // Verificar se há texto suficiente
        if (text.length < 50) {
            recommendations.push('Texto extraído muito curto - verificar se o documento está completo');
        }

        return {
            isValid: confidence >= 60 && text.length >= 50,
            quality,
            confidence,
            textLength: text.length,
            recommendations
        };
    }
}

module.exports = new OCRService();
