import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { VesselRecord } from '../types';

export const exportToExcel = (records: VesselRecord[], filename: string = 'relatorio_embarcacoes') => {
  // Preparar dados para Excel
  const data = records.map((record) => ({
    'Nome da Embarcação': record.vesselName,
    'Tipo de Operação': record.operationType === 'embarque' ? 'Embarque' : 'Desembarque',
    'Data': new Date(record.date).toLocaleDateString('pt-BR'),
    'Horário': record.time,
    'Quantidade de Passageiros': record.passengers,
  }));

  // Criar workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 25 }, // Nome da Embarcação
    { wch: 18 }, // Tipo de Operação
    { wch: 12 }, // Data
    { wch: 10 }, // Horário
    { wch: 22 }, // Quantidade de Passageiros
  ];
  worksheet['!cols'] = colWidths;

  // Gerar arquivo Excel
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (records: VesselRecord[], filename: string = 'relatorio_embarcacoes') => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Registros de Embarcações', 14, 15);

  // Data de geração
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
  doc.text(`Total de registros: ${records.length}`, 14, 27);

  // Preparar dados para a tabela
  const tableData = records.map((record) => [
    record.vesselName,
    record.operationType === 'embarque' ? 'Embarque' : 'Desembarque',
    new Date(record.date).toLocaleDateString('pt-BR'),
    record.time,
    record.passengers.toString(),
  ]);

  // Criar tabela
  autoTable(doc, {
    head: [['Nome da Embarcação', 'Tipo de Operação', 'Data', 'Horário', 'Quantidade de Passageiros']],
    body: tableData,
    startY: 32,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 50 }, // Nome da Embarcação
      1: { cellWidth: 35 }, // Tipo de Operação
      2: { cellWidth: 30 }, // Data
      3: { cellWidth: 25 }, // Horário
      4: { cellWidth: 40 }, // Quantidade de Passageiros
    },
    margin: { top: 32, right: 14, bottom: 14, left: 14 },
  });

  // Salvar PDF
  doc.save(`${filename}.pdf`);
};

