const PDFDocument = require('pdfkit');
const xlsx = require('xlsx');
const pool = require('../config/database');

// Função auxiliar para formatar valores monetários
const formatCurrency = (value) => {
    if (!value) return '0,00';
    return parseFloat(value).toLocaleString('pt-AO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Função auxiliar para formatar datas
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-PT');
};

// Função auxiliar para adicionar cabeçalho ao PDF
const addPDFHeader = (doc, titulo, empresa, exercicio) => {
    doc.fontSize(18).font('Helvetica-Bold').text(titulo, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(empresa || 'ENDIAGRO', { align: 'center' });
    doc.fontSize(10).text(`Exercício: ${exercicio}`, { align: 'center' });
    doc.fontSize(8).text(`Gerado em: ${formatDate(new Date())}`, { align: 'center' });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
};

// Função auxiliar para adicionar rodapé ao PDF
const addPDFFooter = (doc) => {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(
            `Página ${i + 1} de ${pages.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
        );
        doc.fontSize(7).text(
            'ENDIAGRO - Sistema de Gestão Financeira para o Setor Agrícola',
            50,
            doc.page.height - 35,
            { align: 'center' }
        );
    }
};

// ==================== DEMONSTRAÇÃO DE RESULTADOS ====================

exports.gerarDRPDF = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM demonstracao_resultados WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'DR não encontrada' });
        }

        const dr = result.rows[0];
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=DR-${exercicio}.pdf`);
        doc.pipe(res);

        addPDFHeader(doc, 'DEMONSTRAÇÃO DE RESULTADOS', req.user.empresa, exercicio);

        // Vendas e Prestações de Serviços
        doc.fontSize(12).font('Helvetica-Bold').text('VENDAS E PRESTAÇÕES DE SERVIÇOS');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Vendas: ${formatCurrency(dr.vendas)} AOA`);
        doc.text(`Prestações de Serviços: ${formatCurrency(dr.prestacoes_servicos)} AOA`);
        doc.moveDown(0.5);

        // Subsídios e Variações
        doc.fontSize(10).font('Helvetica-Bold').text('SUBSÍDIOS E VARIAÇÕES');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Subsídios à Exploração: ${formatCurrency(dr.subsidios_exploracao)} AOA`);
        doc.text(`Variação de Produção: ${formatCurrency(dr.variacao_producao)} AOA`);
        doc.moveDown(0.5);

        // Fornecimentos e Serviços
        doc.fontSize(10).font('Helvetica-Bold').text('FORNECIMENTOS E SERVIÇOS EXTERNOS');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`CMVMC: ${formatCurrency(dr.cmvmc)} AOA`);
        doc.text(`FSE: ${formatCurrency(dr.fse)} AOA`);
        doc.moveDown(0.5);

        // Valor Acrescentado Bruto
        const vab = parseFloat(dr.vendas || 0) + parseFloat(dr.prestacoes_servicos || 0) +
                    parseFloat(dr.subsidios_exploracao || 0) + parseFloat(dr.variacao_producao || 0) -
                    parseFloat(dr.cmvmc || 0) - parseFloat(dr.fse || 0);

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text(`VALOR ACRESCENTADO BRUTO: ${formatCurrency(vab)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Custos com Pessoal
        doc.fontSize(10).font('Helvetica-Bold').text('CUSTOS COM PESSOAL');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Gastos com Pessoal: ${formatCurrency(dr.gastos_pessoal)} AOA`);
        doc.moveDown(0.5);

        // EBITDA
        const ebitda = vab - parseFloat(dr.gastos_pessoal || 0);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#16a34a');
        doc.text(`EBITDA: ${formatCurrency(ebitda)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Amortizações
        doc.fontSize(10).font('Helvetica-Bold').text('AMORTIZAÇÕES E DEPRECIAÇÕES');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Amortizações: ${formatCurrency(dr.amortizacoes)} AOA`);
        doc.moveDown(0.5);

        // Resultado Operacional
        const resultadoOp = ebitda - parseFloat(dr.amortizacoes || 0);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text(`RESULTADO OPERACIONAL: ${formatCurrency(resultadoOp)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Juros e Resultados Financeiros
        doc.fontSize(10).font('Helvetica-Bold').text('RESULTADOS FINANCEIROS');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Juros e Rendimentos: ${formatCurrency(dr.juros_rendimentos)} AOA`);
        doc.text(`Juros e Gastos: ${formatCurrency(dr.juros_gastos)} AOA`);
        doc.moveDown(0.5);

        // Resultado Antes de Impostos
        const rai = resultadoOp + parseFloat(dr.juros_rendimentos || 0) - parseFloat(dr.juros_gastos || 0);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text(`RESULTADO ANTES DE IMPOSTOS: ${formatCurrency(rai)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Impostos
        doc.fontSize(10).font('Helvetica-Bold').text('IMPOSTOS');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Imposto sobre Rendimento: ${formatCurrency(dr.imposto_rendimento)} AOA`);
        doc.moveDown(0.5);

        // Resultado Líquido
        const resultadoLiquido = rai - parseFloat(dr.imposto_rendimento || 0);
        doc.fontSize(13).font('Helvetica-Bold').fillColor(resultadoLiquido >= 0 ? '#16a34a' : '#dc2626');
        doc.text(`RESULTADO LÍQUIDO DO PERÍODO: ${formatCurrency(resultadoLiquido)} AOA`);
        doc.fillColor('#000000');

        addPDFFooter(doc);
        doc.end();

    } catch (error) {
        console.error('Erro ao gerar PDF da DR:', error);
        res.status(500).json({ message: 'Erro ao gerar PDF da DR' });
    }
};

exports.gerarDRExcel = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM demonstracao_resultados WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'DR não encontrada' });
        }

        const dr = result.rows[0];

        // Calcular valores
        const vab = parseFloat(dr.vendas || 0) + parseFloat(dr.prestacoes_servicos || 0) +
                    parseFloat(dr.subsidios_exploracao || 0) + parseFloat(dr.variacao_producao || 0) -
                    parseFloat(dr.cmvmc || 0) - parseFloat(dr.fse || 0);
        const ebitda = vab - parseFloat(dr.gastos_pessoal || 0);
        const resultadoOp = ebitda - parseFloat(dr.amortizacoes || 0);
        const rai = resultadoOp + parseFloat(dr.juros_rendimentos || 0) - parseFloat(dr.juros_gastos || 0);
        const resultadoLiquido = rai - parseFloat(dr.imposto_rendimento || 0);

        const data = [
            ['DEMONSTRAÇÃO DE RESULTADOS'],
            [`Exercício: ${exercicio}`],
            [`Empresa: ${req.user.empresa || 'ENDIAGRO'}`],
            [`Gerado em: ${formatDate(new Date())}`],
            [],
            ['Descrição', 'Valor (AOA)'],
            ['VENDAS E PRESTAÇÕES DE SERVIÇOS', ''],
            ['Vendas', parseFloat(dr.vendas || 0)],
            ['Prestações de Serviços', parseFloat(dr.prestacoes_servicos || 0)],
            [],
            ['SUBSÍDIOS E VARIAÇÕES', ''],
            ['Subsídios à Exploração', parseFloat(dr.subsidios_exploracao || 0)],
            ['Variação de Produção', parseFloat(dr.variacao_producao || 0)],
            [],
            ['FORNECIMENTOS E SERVIÇOS EXTERNOS', ''],
            ['CMVMC', parseFloat(dr.cmvmc || 0)],
            ['FSE', parseFloat(dr.fse || 0)],
            [],
            ['VALOR ACRESCENTADO BRUTO', vab],
            [],
            ['CUSTOS COM PESSOAL', ''],
            ['Gastos com Pessoal', parseFloat(dr.gastos_pessoal || 0)],
            [],
            ['EBITDA', ebitda],
            [],
            ['AMORTIZAÇÕES E DEPRECIAÇÕES', ''],
            ['Amortizações', parseFloat(dr.amortizacoes || 0)],
            [],
            ['RESULTADO OPERACIONAL', resultadoOp],
            [],
            ['RESULTADOS FINANCEIROS', ''],
            ['Juros e Rendimentos', parseFloat(dr.juros_rendimentos || 0)],
            ['Juros e Gastos', parseFloat(dr.juros_gastos || 0)],
            [],
            ['RESULTADO ANTES DE IMPOSTOS', rai],
            [],
            ['IMPOSTOS', ''],
            ['Imposto sobre Rendimento', parseFloat(dr.imposto_rendimento || 0)],
            [],
            ['RESULTADO LÍQUIDO DO PERÍODO', resultadoLiquido]
        ];

        const ws = xlsx.utils.aoa_to_sheet(data);

        // Definir larguras de colunas
        ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'DR');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=DR-${exercicio}.xlsx`);
        res.send(buffer);

    } catch (error) {
        console.error('Erro ao gerar Excel da DR:', error);
        res.status(500).json({ message: 'Erro ao gerar Excel da DR' });
    }
};

// ==================== BALANÇO PREVISIONAL ====================

exports.gerarBalancoPDF = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM balanco_previsional WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Balanço não encontrado' });
        }

        const balanco = result.rows[0];
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Balanco-${exercicio}.pdf`);
        doc.pipe(res);

        addPDFHeader(doc, 'BALANÇO PREVISIONAL', req.user.empresa, exercicio);

        // ATIVO
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#2563eb').text('ATIVO');
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Ativo Não Corrente
        doc.fontSize(11).font('Helvetica-Bold').text('ATIVO NÃO CORRENTE');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Ativos Fixos Tangíveis: ${formatCurrency(balanco.ativo_fixos_tangiveis)} AOA`);
        doc.text(`Propriedades de Investimento: ${formatCurrency(balanco.ativo_propriedades_investimento)} AOA`);
        doc.text(`Ativos Intangíveis: ${formatCurrency(balanco.ativo_intangiveis)} AOA`);
        doc.text(`Ativos Biológicos: ${formatCurrency(balanco.ativo_biologicos)} AOA`);
        doc.text(`Participações Financeiras: ${formatCurrency(balanco.ativo_participacoes)} AOA`);
        doc.text(`Outros Ativos Financeiros: ${formatCurrency(balanco.ativo_outros_financeiros)} AOA`);

        const totalAtivoNC = parseFloat(balanco.ativo_fixos_tangiveis || 0) +
                            parseFloat(balanco.ativo_propriedades_investimento || 0) +
                            parseFloat(balanco.ativo_intangiveis || 0) +
                            parseFloat(balanco.ativo_biologicos || 0) +
                            parseFloat(balanco.ativo_participacoes || 0) +
                            parseFloat(balanco.ativo_outros_financeiros || 0);

        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text(`Total Ativo Não Corrente: ${formatCurrency(totalAtivoNC)} AOA`);
        doc.moveDown(0.5);

        // Ativo Corrente
        doc.fontSize(11).font('Helvetica-Bold').text('ATIVO CORRENTE');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Inventários: ${formatCurrency(balanco.ativo_inventarios)} AOA`);
        doc.text(`Clientes: ${formatCurrency(balanco.ativo_clientes)} AOA`);
        doc.text(`Estado e Outros Entes Públicos: ${formatCurrency(balanco.ativo_estado)} AOA`);
        doc.text(`Outras Contas a Receber: ${formatCurrency(balanco.ativo_outras_contas_receber)} AOA`);
        doc.text(`Diferimentos: ${formatCurrency(balanco.ativo_diferimentos)} AOA`);
        doc.text(`Caixa e Depósitos Bancários: ${formatCurrency(balanco.ativo_caixa)} AOA`);

        const totalAtivoC = parseFloat(balanco.ativo_inventarios || 0) +
                           parseFloat(balanco.ativo_clientes || 0) +
                           parseFloat(balanco.ativo_estado || 0) +
                           parseFloat(balanco.ativo_outras_contas_receber || 0) +
                           parseFloat(balanco.ativo_diferimentos || 0) +
                           parseFloat(balanco.ativo_caixa || 0);

        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text(`Total Ativo Corrente: ${formatCurrency(totalAtivoC)} AOA`);
        doc.moveDown(0.5);

        const totalAtivo = totalAtivoNC + totalAtivoC;
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text(`TOTAL DO ATIVO: ${formatCurrency(totalAtivo)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(1);

        // Adicionar nova página para Passivo e Capital Próprio
        doc.addPage();
        addPDFHeader(doc, 'BALANÇO PREVISIONAL (Continuação)', req.user.empresa, exercicio);

        // CAPITAL PRÓPRIO
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text('CAPITAL PRÓPRIO');
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        doc.text(`Capital Realizado: ${formatCurrency(balanco.cp_capital_realizado)} AOA`);
        doc.text(`Ações Próprias: ${formatCurrency(balanco.cp_acoes_proprias)} AOA`);
        doc.text(`Outros Instrumentos: ${formatCurrency(balanco.cp_outros_instrumentos)} AOA`);
        doc.text(`Prémios de Emissão: ${formatCurrency(balanco.cp_premios_emissao)} AOA`);
        doc.text(`Reservas Legais: ${formatCurrency(balanco.cp_reservas_legais)} AOA`);
        doc.text(`Outras Reservas: ${formatCurrency(balanco.cp_outras_reservas)} AOA`);
        doc.text(`Resultados Transitados: ${formatCurrency(balanco.cp_resultados_transitados)} AOA`);
        doc.text(`Resultado Líquido: ${formatCurrency(balanco.cp_resultado_liquido)} AOA`);

        const totalCP = parseFloat(balanco.cp_capital_realizado || 0) +
                       parseFloat(balanco.cp_acoes_proprias || 0) +
                       parseFloat(balanco.cp_outros_instrumentos || 0) +
                       parseFloat(balanco.cp_premios_emissao || 0) +
                       parseFloat(balanco.cp_reservas_legais || 0) +
                       parseFloat(balanco.cp_outras_reservas || 0) +
                       parseFloat(balanco.cp_resultados_transitados || 0) +
                       parseFloat(balanco.cp_resultado_liquido || 0);

        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#16a34a');
        doc.text(`TOTAL DO CAPITAL PRÓPRIO: ${formatCurrency(totalCP)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(1);

        // PASSIVO
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#dc2626').text('PASSIVO');
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Passivo Não Corrente
        doc.fontSize(11).font('Helvetica-Bold').text('PASSIVO NÃO CORRENTE');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Provisões: ${formatCurrency(balanco.passivo_provisoes)} AOA`);
        doc.text(`Financiamentos Obtidos: ${formatCurrency(balanco.passivo_financiamentos_nc)} AOA`);
        doc.text(`Outras Contas a Pagar: ${formatCurrency(balanco.passivo_outras_contas_pagar_nc)} AOA`);

        const totalPassivoNC = parseFloat(balanco.passivo_provisoes || 0) +
                              parseFloat(balanco.passivo_financiamentos_nc || 0) +
                              parseFloat(balanco.passivo_outras_contas_pagar_nc || 0);

        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text(`Total Passivo Não Corrente: ${formatCurrency(totalPassivoNC)} AOA`);
        doc.moveDown(0.5);

        // Passivo Corrente
        doc.fontSize(11).font('Helvetica-Bold').text('PASSIVO CORRENTE');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Fornecedores: ${formatCurrency(balanco.passivo_fornecedores)} AOA`);
        doc.text(`Financiamentos Obtidos: ${formatCurrency(balanco.passivo_financiamentos_c)} AOA`);
        doc.text(`Estado e Outros Entes Públicos: ${formatCurrency(balanco.passivo_estado)} AOA`);
        doc.text(`Outras Contas a Pagar: ${formatCurrency(balanco.passivo_outras_contas_pagar_c)} AOA`);
        doc.text(`Diferimentos: ${formatCurrency(balanco.passivo_diferimentos)} AOA`);

        const totalPassivoC = parseFloat(balanco.passivo_fornecedores || 0) +
                             parseFloat(balanco.passivo_financiamentos_c || 0) +
                             parseFloat(balanco.passivo_estado || 0) +
                             parseFloat(balanco.passivo_outras_contas_pagar_c || 0) +
                             parseFloat(balanco.passivo_diferimentos || 0);

        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').text(`Total Passivo Corrente: ${formatCurrency(totalPassivoC)} AOA`);
        doc.moveDown(0.5);

        const totalPassivo = totalPassivoNC + totalPassivoC;
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#dc2626');
        doc.text(`TOTAL DO PASSIVO: ${formatCurrency(totalPassivo)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(1);

        const totalCPePassivo = totalCP + totalPassivo;
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563eb');
        doc.text(`TOTAL DO CAPITAL PRÓPRIO E PASSIVO: ${formatCurrency(totalCPePassivo)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        // Verificação de equilíbrio
        const equilibrado = Math.abs(totalAtivo - totalCPePassivo) < 0.01;
        doc.fontSize(11).font('Helvetica-Bold').fillColor(equilibrado ? '#16a34a' : '#dc2626');
        doc.text(equilibrado ? 'BALANÇO EQUILIBRADO' : 'BALANÇO NÃO EQUILIBRADO');
        doc.fillColor('#000000');

        addPDFFooter(doc);
        doc.end();

    } catch (error) {
        console.error('Erro ao gerar PDF do Balanço:', error);
        res.status(500).json({ message: 'Erro ao gerar PDF do Balanço' });
    }
};

exports.gerarBalancoExcel = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM balanco_previsional WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Balanço não encontrado' });
        }

        const b = result.rows[0];

        // Calcular totais
        const totalAtivoNC = parseFloat(b.ativo_fixos_tangiveis || 0) +
                            parseFloat(b.ativo_propriedades_investimento || 0) +
                            parseFloat(b.ativo_intangiveis || 0) +
                            parseFloat(b.ativo_biologicos || 0) +
                            parseFloat(b.ativo_participacoes || 0) +
                            parseFloat(b.ativo_outros_financeiros || 0);

        const totalAtivoC = parseFloat(b.ativo_inventarios || 0) +
                           parseFloat(b.ativo_clientes || 0) +
                           parseFloat(b.ativo_estado || 0) +
                           parseFloat(b.ativo_outras_contas_receber || 0) +
                           parseFloat(b.ativo_diferimentos || 0) +
                           parseFloat(b.ativo_caixa || 0);

        const totalAtivo = totalAtivoNC + totalAtivoC;

        const totalCP = parseFloat(b.cp_capital_realizado || 0) +
                       parseFloat(b.cp_acoes_proprias || 0) +
                       parseFloat(b.cp_outros_instrumentos || 0) +
                       parseFloat(b.cp_premios_emissao || 0) +
                       parseFloat(b.cp_reservas_legais || 0) +
                       parseFloat(b.cp_outras_reservas || 0) +
                       parseFloat(b.cp_resultados_transitados || 0) +
                       parseFloat(b.cp_resultado_liquido || 0);

        const totalPassivoNC = parseFloat(b.passivo_provisoes || 0) +
                              parseFloat(b.passivo_financiamentos_nc || 0) +
                              parseFloat(b.passivo_outras_contas_pagar_nc || 0);

        const totalPassivoC = parseFloat(b.passivo_fornecedores || 0) +
                             parseFloat(b.passivo_financiamentos_c || 0) +
                             parseFloat(b.passivo_estado || 0) +
                             parseFloat(b.passivo_outras_contas_pagar_c || 0) +
                             parseFloat(b.passivo_diferimentos || 0);

        const totalPassivo = totalPassivoNC + totalPassivoC;
        const totalCPePassivo = totalCP + totalPassivo;

        const data = [
            ['BALANÇO PREVISIONAL'],
            [`Exercício: ${exercicio}`],
            [`Empresa: ${req.user.empresa || 'ENDIAGRO'}`],
            [],
            ['ATIVO', 'Valor (AOA)', '', 'CAPITAL PRÓPRIO E PASSIVO', 'Valor (AOA)'],
            [],
            ['ATIVO NÃO CORRENTE', '', '', 'CAPITAL PRÓPRIO', ''],
            ['Ativos Fixos Tangíveis', parseFloat(b.ativo_fixos_tangiveis || 0), '', 'Capital Realizado', parseFloat(b.cp_capital_realizado || 0)],
            ['Propriedades de Investimento', parseFloat(b.ativo_propriedades_investimento || 0), '', 'Ações Próprias', parseFloat(b.cp_acoes_proprias || 0)],
            ['Ativos Intangíveis', parseFloat(b.ativo_intangiveis || 0), '', 'Outros Instrumentos', parseFloat(b.cp_outros_instrumentos || 0)],
            ['Ativos Biológicos', parseFloat(b.ativo_biologicos || 0), '', 'Prémios de Emissão', parseFloat(b.cp_premios_emissao || 0)],
            ['Participações Financeiras', parseFloat(b.ativo_participacoes || 0), '', 'Reservas Legais', parseFloat(b.cp_reservas_legais || 0)],
            ['Outros Ativos Financeiros', parseFloat(b.ativo_outros_financeiros || 0), '', 'Outras Reservas', parseFloat(b.cp_outras_reservas || 0)],
            ['Total Ativo Não Corrente', totalAtivoNC, '', 'Resultados Transitados', parseFloat(b.cp_resultados_transitados || 0)],
            ['', '', '', 'Resultado Líquido', parseFloat(b.cp_resultado_liquido || 0)],
            ['ATIVO CORRENTE', '', '', 'Total Capital Próprio', totalCP],
            ['Inventários', parseFloat(b.ativo_inventarios || 0), '', '', ''],
            ['Clientes', parseFloat(b.ativo_clientes || 0), '', 'PASSIVO NÃO CORRENTE', ''],
            ['Estado e Outros Entes', parseFloat(b.ativo_estado || 0), '', 'Provisões', parseFloat(b.passivo_provisoes || 0)],
            ['Outras Contas a Receber', parseFloat(b.ativo_outras_contas_receber || 0), '', 'Financiamentos Obtidos', parseFloat(b.passivo_financiamentos_nc || 0)],
            ['Diferimentos', parseFloat(b.ativo_diferimentos || 0), '', 'Outras Contas a Pagar', parseFloat(b.passivo_outras_contas_pagar_nc || 0)],
            ['Caixa e Depósitos', parseFloat(b.ativo_caixa || 0), '', 'Total Passivo Não Corrente', totalPassivoNC],
            ['Total Ativo Corrente', totalAtivoC, '', '', ''],
            ['', '', '', 'PASSIVO CORRENTE', ''],
            ['', '', '', 'Fornecedores', parseFloat(b.passivo_fornecedores || 0)],
            ['', '', '', 'Financiamentos Obtidos', parseFloat(b.passivo_financiamentos_c || 0)],
            ['', '', '', 'Estado e Outros Entes', parseFloat(b.passivo_estado || 0)],
            ['', '', '', 'Outras Contas a Pagar', parseFloat(b.passivo_outras_contas_pagar_c || 0)],
            ['', '', '', 'Diferimentos', parseFloat(b.passivo_diferimentos || 0)],
            ['', '', '', 'Total Passivo Corrente', totalPassivoC],
            ['', '', '', '', ''],
            ['TOTAL DO ATIVO', totalAtivo, '', 'TOTAL PASSIVO', totalPassivo],
            ['', '', '', 'TOTAL CP E PASSIVO', totalCPePassivo]
        ];

        const ws = xlsx.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 5 }, { wch: 30 }, { wch: 20 }];

        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Balanço');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Balanco-${exercicio}.xlsx`);
        res.send(buffer);

    } catch (error) {
        console.error('Erro ao gerar Excel do Balanço:', error);
        res.status(500).json({ message: 'Erro ao gerar Excel do Balanço' });
    }
};

// ==================== TESOURARIA MENSAL ====================

exports.gerarTesourariaPDF = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM tesouraria_mensal WHERE user_id = $1 AND exercicio = $2 ORDER BY mes',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tesouraria não encontrada' });
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Tesouraria-${exercicio}.pdf`);
        doc.pipe(res);

        addPDFHeader(doc, 'PLANO DE TESOURARIA MENSAL', req.user.empresa, exercicio);

        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        // Criar tabela
        const tableTop = doc.y;
        const colWidth = 60;
        const rowHeight = 20;

        // Cabeçalho
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Rubrica', 50, tableTop);

        for (let i = 0; i < 12; i++) {
            doc.text(meses[i], 150 + i * colWidth, tableTop, { width: colWidth, align: 'center' });
        }

        let y = tableTop + rowHeight;

        // Saldo Inicial
        doc.font('Helvetica');
        doc.text('Saldo Inicial', 50, y);
        result.rows.forEach((row, i) => {
            doc.text(formatCurrency(row.saldo_inicial), 150 + i * colWidth, y, { width: colWidth, align: 'right' });
        });
        y += rowHeight;

        // Recebimentos
        doc.font('Helvetica-Bold');
        doc.text('RECEBIMENTOS', 50, y);
        y += rowHeight;

        const rubricasRecebimentos = [
            { label: 'Clientes', field: 'recebimentos_clientes' },
            { label: 'Subsídios', field: 'recebimentos_subsidios' },
            { label: 'Outros', field: 'recebimentos_outros' }
        ];

        doc.font('Helvetica');
        rubricasRecebimentos.forEach(rubrica => {
            doc.text(rubrica.label, 60, y);
            result.rows.forEach((row, i) => {
                doc.text(formatCurrency(row[rubrica.field]), 150 + i * colWidth, y, { width: colWidth, align: 'right' });
            });
            y += rowHeight;
        });

        // Total Recebimentos
        doc.font('Helvetica-Bold');
        doc.text('Total Recebimentos', 50, y);
        result.rows.forEach((row, i) => {
            const total = parseFloat(row.recebimentos_clientes || 0) +
                         parseFloat(row.recebimentos_subsidios || 0) +
                         parseFloat(row.recebimentos_outros || 0);
            doc.text(formatCurrency(total), 150 + i * colWidth, y, { width: colWidth, align: 'right' });
        });
        y += rowHeight + 5;

        // Verificar se precisa de nova página
        if (y > 500) {
            doc.addPage({ size: 'A4', layout: 'landscape' });
            y = 50;
        }

        // Pagamentos
        doc.font('Helvetica-Bold');
        doc.text('PAGAMENTOS', 50, y);
        y += rowHeight;

        const rubricasPagamentos = [
            { label: 'Fornecedores', field: 'pagamentos_fornecedores' },
            { label: 'Pessoal', field: 'pagamentos_pessoal' },
            { label: 'Impostos', field: 'pagamentos_impostos' },
            { label: 'Investimentos', field: 'pagamentos_investimentos' },
            { label: 'Financiamentos', field: 'pagamentos_financiamentos' },
            { label: 'Outros', field: 'pagamentos_outros' }
        ];

        doc.font('Helvetica');
        rubricasPagamentos.forEach(rubrica => {
            doc.text(rubrica.label, 60, y);
            result.rows.forEach((row, i) => {
                doc.text(formatCurrency(row[rubrica.field]), 150 + i * colWidth, y, { width: colWidth, align: 'right' });
            });
            y += rowHeight;
        });

        // Total Pagamentos
        doc.font('Helvetica-Bold');
        doc.text('Total Pagamentos', 50, y);
        result.rows.forEach((row, i) => {
            const total = parseFloat(row.pagamentos_fornecedores || 0) +
                         parseFloat(row.pagamentos_pessoal || 0) +
                         parseFloat(row.pagamentos_impostos || 0) +
                         parseFloat(row.pagamentos_investimentos || 0) +
                         parseFloat(row.pagamentos_financiamentos || 0) +
                         parseFloat(row.pagamentos_outros || 0);
            doc.text(formatCurrency(total), 150 + i * colWidth, y, { width: colWidth, align: 'right' });
        });
        y += rowHeight + 5;

        // Saldo Final
        doc.font('Helvetica-Bold').fillColor('#2563eb');
        doc.text('Saldo Final', 50, y);
        result.rows.forEach((row, i) => {
            doc.text(formatCurrency(row.saldo_final), 150 + i * colWidth, y, { width: colWidth, align: 'right' });
        });

        addPDFFooter(doc);
        doc.end();

    } catch (error) {
        console.error('Erro ao gerar PDF da Tesouraria:', error);
        res.status(500).json({ message: 'Erro ao gerar PDF da Tesouraria' });
    }
};

exports.gerarTesourariaExcel = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM tesouraria_mensal WHERE user_id = $1 AND exercicio = $2 ORDER BY mes',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tesouraria não encontrada' });
        }

        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        const data = [
            ['PLANO DE TESOURARIA MENSAL'],
            [`Exercício: ${exercicio}`],
            [],
            ['Rubrica', ...meses],
        ];

        // Saldo Inicial
        const saldoInicial = ['Saldo Inicial'];
        result.rows.forEach(row => saldoInicial.push(parseFloat(row.saldo_inicial || 0)));
        data.push(saldoInicial);

        data.push(['']); // Linha vazia
        data.push(['RECEBIMENTOS']);

        // Recebimentos
        const recClientes = ['Clientes'];
        const recSubsidios = ['Subsídios'];
        const recOutros = ['Outros Recebimentos'];
        const totalRec = ['Total Recebimentos'];

        result.rows.forEach(row => {
            recClientes.push(parseFloat(row.recebimentos_clientes || 0));
            recSubsidios.push(parseFloat(row.recebimentos_subsidios || 0));
            recOutros.push(parseFloat(row.recebimentos_outros || 0));
            totalRec.push(
                parseFloat(row.recebimentos_clientes || 0) +
                parseFloat(row.recebimentos_subsidios || 0) +
                parseFloat(row.recebimentos_outros || 0)
            );
        });

        data.push(recClientes);
        data.push(recSubsidios);
        data.push(recOutros);
        data.push(totalRec);

        data.push(['']); // Linha vazia
        data.push(['PAGAMENTOS']);

        // Pagamentos
        const pagFornecedores = ['Fornecedores'];
        const pagPessoal = ['Pessoal'];
        const pagImpostos = ['Impostos'];
        const pagInvestimentos = ['Investimentos'];
        const pagFinanciamentos = ['Financiamentos'];
        const pagOutros = ['Outros Pagamentos'];
        const totalPag = ['Total Pagamentos'];

        result.rows.forEach(row => {
            pagFornecedores.push(parseFloat(row.pagamentos_fornecedores || 0));
            pagPessoal.push(parseFloat(row.pagamentos_pessoal || 0));
            pagImpostos.push(parseFloat(row.pagamentos_impostos || 0));
            pagInvestimentos.push(parseFloat(row.pagamentos_investimentos || 0));
            pagFinanciamentos.push(parseFloat(row.pagamentos_financiamentos || 0));
            pagOutros.push(parseFloat(row.pagamentos_outros || 0));
            totalPag.push(
                parseFloat(row.pagamentos_fornecedores || 0) +
                parseFloat(row.pagamentos_pessoal || 0) +
                parseFloat(row.pagamentos_impostos || 0) +
                parseFloat(row.pagamentos_investimentos || 0) +
                parseFloat(row.pagamentos_financiamentos || 0) +
                parseFloat(row.pagamentos_outros || 0)
            );
        });

        data.push(pagFornecedores);
        data.push(pagPessoal);
        data.push(pagImpostos);
        data.push(pagInvestimentos);
        data.push(pagFinanciamentos);
        data.push(pagOutros);
        data.push(totalPag);

        data.push(['']); // Linha vazia

        // Saldo Final
        const saldoFinal = ['Saldo Final'];
        result.rows.forEach(row => saldoFinal.push(parseFloat(row.saldo_final || 0)));
        data.push(saldoFinal);

        const ws = xlsx.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 25 }, ...Array(12).fill({ wch: 12 })];

        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Tesouraria');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Tesouraria-${exercicio}.xlsx`);
        res.send(buffer);

    } catch (error) {
        console.error('Erro ao gerar Excel da Tesouraria:', error);
        res.status(500).json({ message: 'Erro ao gerar Excel da Tesouraria' });
    }
};

// ==================== CASH FLOW ====================

exports.gerarCashFlowPDF = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM cash_flow WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cash Flow não encontrado' });
        }

        const cf = result.rows[0];
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CashFlow-${exercicio}.pdf`);
        doc.pipe(res);

        addPDFHeader(doc, 'DEMONSTRAÇÃO DE FLUXO DE CAIXA', req.user.empresa, exercicio);

        // Fluxo Operacional
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563eb').text('FLUXO DE CAIXA DAS ATIVIDADES OPERACIONAIS');
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        doc.text('Recebimentos:');
        doc.text(`  Clientes: ${formatCurrency(cf.recebimentos_clientes)} AOA`);
        doc.text(`  Outros Recebimentos: ${formatCurrency(cf.outros_recebimentos_operacionais)} AOA`);
        doc.moveDown(0.3);
        doc.text('Pagamentos:');
        doc.text(`  Fornecedores: ${formatCurrency(cf.pagamentos_fornecedores)} AOA`);
        doc.text(`  Pessoal: ${formatCurrency(cf.pagamentos_pessoal)} AOA`);
        doc.text(`  Impostos: ${formatCurrency(cf.pagamentos_impostos)} AOA`);
        doc.text(`  Outros Pagamentos: ${formatCurrency(cf.outros_pagamentos_operacionais)} AOA`);
        doc.moveDown(0.5);

        const fluxoOp = parseFloat(cf.recebimentos_clientes || 0) +
                       parseFloat(cf.outros_recebimentos_operacionais || 0) -
                       parseFloat(cf.pagamentos_fornecedores || 0) -
                       parseFloat(cf.pagamentos_pessoal || 0) -
                       parseFloat(cf.pagamentos_impostos || 0) -
                       parseFloat(cf.outros_pagamentos_operacionais || 0);

        doc.fontSize(12).font('Helvetica-Bold').fillColor(fluxoOp >= 0 ? '#16a34a' : '#dc2626');
        doc.text(`Fluxo Operacional: ${formatCurrency(fluxoOp)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(1);

        // Fluxo de Investimento
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563eb').text('FLUXO DE CAIXA DAS ATIVIDADES DE INVESTIMENTO');
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        doc.text('Recebimentos:');
        doc.text(`  Venda de Ativos Fixos: ${formatCurrency(cf.recebimentos_venda_ativos)} AOA`);
        doc.text(`  Juros e Dividendos Recebidos: ${formatCurrency(cf.recebimentos_juros_dividendos)} AOA`);
        doc.text(`  Outros Recebimentos: ${formatCurrency(cf.outros_recebimentos_investimento)} AOA`);
        doc.moveDown(0.3);
        doc.text('Pagamentos:');
        doc.text(`  Aquisição de Ativos Fixos: ${formatCurrency(cf.pagamentos_aquisicao_ativos)} AOA`);
        doc.text(`  Outros Pagamentos: ${formatCurrency(cf.outros_pagamentos_investimento)} AOA`);
        doc.moveDown(0.5);

        const fluxoInv = parseFloat(cf.recebimentos_venda_ativos || 0) +
                        parseFloat(cf.recebimentos_juros_dividendos || 0) +
                        parseFloat(cf.outros_recebimentos_investimento || 0) -
                        parseFloat(cf.pagamentos_aquisicao_ativos || 0) -
                        parseFloat(cf.outros_pagamentos_investimento || 0);

        doc.fontSize(12).font('Helvetica-Bold').fillColor(fluxoInv >= 0 ? '#16a34a' : '#dc2626');
        doc.text(`Fluxo de Investimento: ${formatCurrency(fluxoInv)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(1);

        // Fluxo de Financiamento
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563eb').text('FLUXO DE CAIXA DAS ATIVIDADES DE FINANCIAMENTO');
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica');
        doc.text('Recebimentos:');
        doc.text(`  Empréstimos Obtidos: ${formatCurrency(cf.recebimentos_emprestimos)} AOA`);
        doc.text(`  Outros Recebimentos: ${formatCurrency(cf.outros_recebimentos_financiamento)} AOA`);
        doc.moveDown(0.3);
        doc.text('Pagamentos:');
        doc.text(`  Amortização de Empréstimos: ${formatCurrency(cf.pagamentos_emprestimos)} AOA`);
        doc.text(`  Juros Pagos: ${formatCurrency(cf.pagamentos_juros)} AOA`);
        doc.text(`  Dividendos Pagos: ${formatCurrency(cf.pagamentos_dividendos)} AOA`);
        doc.text(`  Outros Pagamentos: ${formatCurrency(cf.outros_pagamentos_financiamento)} AOA`);
        doc.moveDown(0.5);

        const fluxoFin = parseFloat(cf.recebimentos_emprestimos || 0) +
                        parseFloat(cf.outros_recebimentos_financiamento || 0) -
                        parseFloat(cf.pagamentos_emprestimos || 0) -
                        parseFloat(cf.pagamentos_juros || 0) -
                        parseFloat(cf.pagamentos_dividendos || 0) -
                        parseFloat(cf.outros_pagamentos_financiamento || 0);

        doc.fontSize(12).font('Helvetica-Bold').fillColor(fluxoFin >= 0 ? '#16a34a' : '#dc2626');
        doc.text(`Fluxo de Financiamento: ${formatCurrency(fluxoFin)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(1);

        // Resumo
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`Saldo Inicial de Caixa: ${formatCurrency(cf.saldo_inicial)} AOA`);
        doc.moveDown(0.3);

        const variacaoCaixa = fluxoOp + fluxoInv + fluxoFin;
        doc.text(`Variação de Caixa: ${formatCurrency(variacaoCaixa)} AOA`);
        doc.moveDown(0.3);

        const saldoFinal = parseFloat(cf.saldo_inicial || 0) + variacaoCaixa;
        doc.fontSize(13).fillColor('#2563eb');
        doc.text(`Saldo Final de Caixa: ${formatCurrency(saldoFinal)} AOA`);
        doc.fillColor('#000000');
        doc.moveDown(0.3);

        doc.fontSize(10).font('Helvetica');
        doc.text(`Saldo Final Registrado: ${formatCurrency(cf.saldo_final)} AOA`);

        const reconciliado = Math.abs(saldoFinal - parseFloat(cf.saldo_final || 0)) < 0.01;
        doc.fontSize(11).font('Helvetica-Bold').fillColor(reconciliado ? '#16a34a' : '#dc2626');
        doc.text(reconciliado ? 'RECONCILIADO' : 'NÃO RECONCILIADO');
        doc.fillColor('#000000');

        addPDFFooter(doc);
        doc.end();

    } catch (error) {
        console.error('Erro ao gerar PDF do Cash Flow:', error);
        res.status(500).json({ message: 'Erro ao gerar PDF do Cash Flow' });
    }
};

exports.gerarCashFlowExcel = async (req, res) => {
    try {
        const { exercicio } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM cash_flow WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cash Flow não encontrado' });
        }

        const cf = result.rows[0];

        const fluxoOp = parseFloat(cf.recebimentos_clientes || 0) +
                       parseFloat(cf.outros_recebimentos_operacionais || 0) -
                       parseFloat(cf.pagamentos_fornecedores || 0) -
                       parseFloat(cf.pagamentos_pessoal || 0) -
                       parseFloat(cf.pagamentos_impostos || 0) -
                       parseFloat(cf.outros_pagamentos_operacionais || 0);

        const fluxoInv = parseFloat(cf.recebimentos_venda_ativos || 0) +
                        parseFloat(cf.recebimentos_juros_dividendos || 0) +
                        parseFloat(cf.outros_recebimentos_investimento || 0) -
                        parseFloat(cf.pagamentos_aquisicao_ativos || 0) -
                        parseFloat(cf.outros_pagamentos_investimento || 0);

        const fluxoFin = parseFloat(cf.recebimentos_emprestimos || 0) +
                        parseFloat(cf.outros_recebimentos_financiamento || 0) -
                        parseFloat(cf.pagamentos_emprestimos || 0) -
                        parseFloat(cf.pagamentos_juros || 0) -
                        parseFloat(cf.pagamentos_dividendos || 0) -
                        parseFloat(cf.outros_pagamentos_financiamento || 0);

        const variacaoCaixa = fluxoOp + fluxoInv + fluxoFin;
        const saldoFinal = parseFloat(cf.saldo_inicial || 0) + variacaoCaixa;

        const data = [
            ['DEMONSTRAÇÃO DE FLUXO DE CAIXA'],
            [`Exercício: ${exercicio}`],
            [],
            ['ATIVIDADES OPERACIONAIS', 'Valor (AOA)'],
            ['Recebimentos de Clientes', parseFloat(cf.recebimentos_clientes || 0)],
            ['Outros Recebimentos Operacionais', parseFloat(cf.outros_recebimentos_operacionais || 0)],
            ['Pagamentos a Fornecedores', -parseFloat(cf.pagamentos_fornecedores || 0)],
            ['Pagamentos a Pessoal', -parseFloat(cf.pagamentos_pessoal || 0)],
            ['Pagamentos de Impostos', -parseFloat(cf.pagamentos_impostos || 0)],
            ['Outros Pagamentos Operacionais', -parseFloat(cf.outros_pagamentos_operacionais || 0)],
            ['Fluxo Operacional', fluxoOp],
            [],
            ['ATIVIDADES DE INVESTIMENTO', ''],
            ['Recebimentos Venda de Ativos', parseFloat(cf.recebimentos_venda_ativos || 0)],
            ['Recebimentos Juros e Dividendos', parseFloat(cf.recebimentos_juros_dividendos || 0)],
            ['Outros Recebimentos Investimento', parseFloat(cf.outros_recebimentos_investimento || 0)],
            ['Pagamentos Aquisição de Ativos', -parseFloat(cf.pagamentos_aquisicao_ativos || 0)],
            ['Outros Pagamentos Investimento', -parseFloat(cf.outros_pagamentos_investimento || 0)],
            ['Fluxo de Investimento', fluxoInv],
            [],
            ['ATIVIDADES DE FINANCIAMENTO', ''],
            ['Recebimentos de Empréstimos', parseFloat(cf.recebimentos_emprestimos || 0)],
            ['Outros Recebimentos Financiamento', parseFloat(cf.outros_recebimentos_financiamento || 0)],
            ['Pagamentos de Empréstimos', -parseFloat(cf.pagamentos_emprestimos || 0)],
            ['Pagamentos de Juros', -parseFloat(cf.pagamentos_juros || 0)],
            ['Pagamentos de Dividendos', -parseFloat(cf.pagamentos_dividendos || 0)],
            ['Outros Pagamentos Financiamento', -parseFloat(cf.outros_pagamentos_financiamento || 0)],
            ['Fluxo de Financiamento', fluxoFin],
            [],
            ['RESUMO', ''],
            ['Saldo Inicial de Caixa', parseFloat(cf.saldo_inicial || 0)],
            ['Variação de Caixa', variacaoCaixa],
            ['Saldo Final Calculado', saldoFinal],
            ['Saldo Final Registrado', parseFloat(cf.saldo_final || 0)],
            ['Diferença', Math.abs(saldoFinal - parseFloat(cf.saldo_final || 0))]
        ];

        const ws = xlsx.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Cash Flow');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=CashFlow-${exercicio}.xlsx`);
        res.send(buffer);

    } catch (error) {
        console.error('Erro ao gerar Excel do Cash Flow:', error);
        res.status(500).json({ message: 'Erro ao gerar Excel do Cash Flow' });
    }
};

module.exports = exports;
