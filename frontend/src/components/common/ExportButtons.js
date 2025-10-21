import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { relatoriosService } from '../../services/api';

const ExportButtons = ({ exercicio, tipo, className = '' }) => {
    const [loading, setLoading] = useState({ pdf: false, excel: false });

    const handleExportPDF = async () => {
        try {
            setLoading({ ...loading, pdf: true });

            switch (tipo) {
                case 'dr':
                    await relatoriosService.exportarDRPDF(exercicio);
                    break;
                case 'balanco':
                    await relatoriosService.exportarBalancoPDF(exercicio);
                    break;
                case 'tesouraria':
                    await relatoriosService.exportarTesourariaPDF(exercicio);
                    break;
                case 'cash-flow':
                    await relatoriosService.exportarCashFlowPDF(exercicio);
                    break;
                default:
                    throw new Error('Tipo de relatório inválido');
            }
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF. Verifique se os dados estão salvos.');
        } finally {
            setLoading({ ...loading, pdf: false });
        }
    };

    const handleExportExcel = async () => {
        try {
            setLoading({ ...loading, excel: true });

            switch (tipo) {
                case 'dr':
                    await relatoriosService.exportarDRExcel(exercicio);
                    break;
                case 'balanco':
                    await relatoriosService.exportarBalancoExcel(exercicio);
                    break;
                case 'tesouraria':
                    await relatoriosService.exportarTesourariaExcel(exercicio);
                    break;
                case 'cash-flow':
                    await relatoriosService.exportarCashFlowExcel(exercicio);
                    break;
                default:
                    throw new Error('Tipo de relatório inválido');
            }
        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            alert('Erro ao exportar Excel. Verifique se os dados estão salvos.');
        } finally {
            setLoading({ ...loading, excel: false });
        }
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            <button
                onClick={handleExportPDF}
                disabled={loading.pdf || !exercicio}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar para PDF"
            >
                <FileText size={20} />
                {loading.pdf ? 'Exportando...' : 'PDF'}
            </button>

            <button
                onClick={handleExportExcel}
                disabled={loading.excel || !exercicio}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar para Excel"
            >
                <Download size={20} />
                {loading.excel ? 'Exportando...' : 'Excel'}
            </button>
        </div>
    );
};

export default ExportButtons;
