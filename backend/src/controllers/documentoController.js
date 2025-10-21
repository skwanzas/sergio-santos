const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const ocrService = require('../services/ocrService');
const iaService = require('../services/iaService');

class DocumentoController {
    /**
     * Upload de documento
     * POST /api/documentos/upload
     */
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'Nenhum ficheiro foi enviado'
                });
            }

            const empresa_id = req.user.empresa_id;
            const user_id = req.user.userId;

            // Informações do ficheiro
            const nomeFicheiro = req.file.originalname;
            const caminhoFicheiro = req.file.path;
            const tipoFicheiro = req.file.mimetype;

            // Guardar documento na base de dados
            const result = await db.query(
                `INSERT INTO documentos (
                    empresa_id, user_id, nome_ficheiro, caminho_ficheiro,
                    status
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [empresa_id, user_id, nomeFicheiro, caminhoFicheiro, 'pendente']
            );

            const documento = result.rows[0];

            res.status(201).json({
                message: 'Documento carregado com sucesso',
                documento: {
                    id: documento.id,
                    nome_ficheiro: documento.nome_ficheiro,
                    status: documento.status,
                    created_at: documento.created_at
                }
            });

        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({
                error: 'Erro ao carregar documento',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Processar OCR de um documento
     * POST /api/documentos/:id/ocr
     */
    async processOCR(req, res) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const { id } = req.params;
            const empresa_id = req.user.empresa_id;

            // Buscar documento
            const docResult = await client.query(
                'SELECT * FROM documentos WHERE id = $1 AND empresa_id = $2',
                [id, empresa_id]
            );

            if (docResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Documento não encontrado'
                });
            }

            const documento = docResult.rows[0];

            // Verificar se o ficheiro existe
            try {
                await fs.access(documento.caminho_ficheiro);
            } catch (error) {
                return res.status(404).json({
                    error: 'Ficheiro não encontrado no sistema'
                });
            }

            // Executar OCR
            console.log(`📄 Processando OCR do documento ${id}...`);
            const ocrResult = await ocrService.processDocument(documento.caminho_ficheiro);

            // Limpar texto
            const textoLimpo = ocrService.cleanText(ocrResult.text);

            // Extrair informações básicas
            const info = ocrService.extractInfo(textoLimpo);

            // Validar qualidade
            const qualidade = ocrService.validateQuality(ocrResult.confidence, textoLimpo);

            // Classificar com IA (se disponível)
            let classificacao = null;
            if (iaService.isEnabled && qualidade.isValid) {
                try {
                    console.log('🤖 Classificando com IA...');
                    classificacao = await iaService.classifyDocument(textoLimpo);
                } catch (error) {
                    console.warn('⚠️  Classificação IA falhou, usando fallback:', error.message);
                    // Usar classificação baseada em palavras-chave
                    const categoria = iaService.suggestCategoryByKeywords(textoLimpo, 'saida');
                    classificacao = {
                        categoria_sugerida: categoria,
                        tipo_movimento: 'saida',
                        confianca: 'baixa',
                        tipo_documento: 'outro',
                        observacoes: 'Classificação baseada em palavras-chave'
                    };
                }
            } else {
                // IA não disponível - usar classificação por palavras-chave
                console.log('ℹ️  IA não disponível, usando classificação por palavras-chave');
                const categoria = iaService.suggestCategoryByKeywords(textoLimpo, 'saida');
                classificacao = {
                    categoria_sugerida: categoria,
                    tipo_movimento: 'saida',
                    confianca: 'baixa',
                    tipo_documento: 'outro',
                    observacoes: 'Classificação sem IA - Requer validação manual'
                };
            }

            // Atualizar documento com as informações
            await client.query(
                `UPDATE documentos
                 SET tipo_documento = $1,
                     numero_documento = $2,
                     data_documento = $3,
                     fornecedor_cliente = $4,
                     descricao = $5,
                     valor_total = $6,
                     moeda = $7,
                     categoria_sugerida = $8,
                     tipo_movimento = $9,
                     confianca = $10,
                     observacoes = $11,
                     status = $12
                 WHERE id = $13`,
                [
                    classificacao?.tipo_documento || 'outro',
                    classificacao?.numero_documento || info.numbers[0] || null,
                    classificacao?.data || info.dates[0] || null,
                    classificacao?.fornecedor_cliente || null,
                    classificacao?.descricao || null,
                    classificacao?.valor_total || (info.amounts[0] ? parseFloat(info.amounts[0].replace(/[.,]/g, '')) / 100 : null),
                    classificacao?.moeda || 'AOA',
                    classificacao?.categoria_sugerida || '618',
                    classificacao?.tipo_movimento || 'saida',
                    classificacao?.confianca || 'baixa',
                    classificacao?.observacoes || null,
                    'processado',
                    id
                ]
            );

            await client.query('COMMIT');

            res.json({
                message: 'OCR processado com sucesso',
                ocr: {
                    texto: textoLimpo.substring(0, 500) + '...', // Apenas os primeiros 500 caracteres
                    textoCompleto: textoLimpo.length,
                    confidence: ocrResult.confidence,
                    qualidade: qualidade.quality,
                    tipo: ocrResult.type
                },
                classificacao,
                informacoes: info,
                validacao: qualidade
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao processar OCR:', error);
            res.status(500).json({
                error: 'Erro ao processar OCR do documento',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            client.release();
        }
    }

    /**
     * Aplicar documento classificado ao Balanço de Execução
     * POST /api/documentos/:id/apply
     */
    async applyDocumento(req, res) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const { id } = req.params;
            const empresa_id = req.user.empresa_id;

            // Buscar documento
            const docResult = await client.query(
                `SELECT * FROM documentos
                 WHERE id = $1 AND empresa_id = $2 AND status = 'processado'`,
                [id, empresa_id]
            );

            if (docResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Documento não encontrado ou não processado'
                });
            }

            const documento = docResult.rows[0];

            if (documento.aplicado) {
                return res.status(400).json({
                    error: 'Documento já foi aplicado ao Balanço de Execução'
                });
            }

            // TODO: Implementar lógica para aplicar ao Balanço de Execução
            // (quando o módulo de Balanço de Execução for implementado)

            // Por enquanto, apenas marcar como aplicado
            await client.query(
                `UPDATE documentos
                 SET aplicado = true,
                     data_aplicacao = CURRENT_TIMESTAMP,
                     status = 'validado'
                 WHERE id = $1`,
                [id]
            );

            await client.query('COMMIT');

            res.json({
                message: 'Documento aplicado com sucesso',
                documento: {
                    id: documento.id,
                    categoria: documento.categoria_sugerida,
                    valor: documento.valor_total,
                    tipo_movimento: documento.tipo_movimento
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao aplicar documento:', error);
            res.status(500).json({
                error: 'Erro ao aplicar documento',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            client.release();
        }
    }

    /**
     * Listar documentos
     * GET /api/documentos
     */
    async listDocumentos(req, res) {
        try {
            const empresa_id = req.user.empresa_id;
            const { status, limit = 50, offset = 0 } = req.query;

            let query = `
                SELECT d.*, u.nome as user_nome
                FROM documentos d
                LEFT JOIN users u ON d.user_id = u.id
                WHERE d.empresa_id = $1
            `;
            const params = [empresa_id];

            if (status) {
                query += ` AND d.status = $${params.length + 1}`;
                params.push(status);
            }

            query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limit, offset);

            const result = await db.query(query, params);

            res.json({
                documentos: result.rows,
                total: result.rows.length
            });

        } catch (error) {
            console.error('Erro ao listar documentos:', error);
            res.status(500).json({
                error: 'Erro ao listar documentos'
            });
        }
    }

    /**
     * Obter documento específico
     * GET /api/documentos/:id
     */
    async getDocumento(req, res) {
        try {
            const { id } = req.params;
            const empresa_id = req.user.empresa_id;

            const result = await db.query(
                `SELECT d.*, u.nome as user_nome
                 FROM documentos d
                 LEFT JOIN users u ON d.user_id = u.id
                 WHERE d.id = $1 AND d.empresa_id = $2`,
                [id, empresa_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Documento não encontrado'
                });
            }

            res.json({
                documento: result.rows[0]
            });

        } catch (error) {
            console.error('Erro ao obter documento:', error);
            res.status(500).json({
                error: 'Erro ao obter documento'
            });
        }
    }

    /**
     * Eliminar documento
     * DELETE /api/documentos/:id
     */
    async deleteDocumento(req, res) {
        try {
            const { id } = req.params;
            const empresa_id = req.user.empresa_id;

            // Buscar documento
            const docResult = await db.query(
                'SELECT * FROM documentos WHERE id = $1 AND empresa_id = $2',
                [id, empresa_id]
            );

            if (docResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Documento não encontrado'
                });
            }

            const documento = docResult.rows[0];

            // Eliminar ficheiro físico
            try {
                await fs.unlink(documento.caminho_ficheiro);
            } catch (error) {
                console.warn('⚠️  Ficheiro físico não encontrado ou já eliminado');
            }

            // Eliminar da base de dados
            await db.query(
                'DELETE FROM documentos WHERE id = $1',
                [id]
            );

            res.json({
                message: 'Documento eliminado com sucesso'
            });

        } catch (error) {
            console.error('Erro ao eliminar documento:', error);
            res.status(500).json({
                error: 'Erro ao eliminar documento'
            });
        }
    }
}

module.exports = new DocumentoController();
