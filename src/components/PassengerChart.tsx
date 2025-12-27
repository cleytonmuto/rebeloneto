import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { VesselRecord } from '../types';
import './PassengerChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PassengerChartProps {
  records: VesselRecord[];
}

type TimeFilter = 'all' | 'today' | 'week' | 'month';

export const PassengerChart = ({ records }: PassengerChartProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filteredRecords = useMemo(() => {
    if (timeFilter === 'all') return records;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    return records.filter((record) => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      
      switch (timeFilter) {
        case 'today':
          return recordDate.getTime() === today.getTime();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return recordDate >= weekAgo && recordDate <= today;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return recordDate >= monthAgo && recordDate <= today;
        default:
          return true;
      }
    });
  }, [records, timeFilter]);

  const chartData = useMemo(() => {
    const embarque = filteredRecords
      .filter((r) => r.operationType === 'embarque')
      .reduce((sum, r) => sum + r.passengers, 0);
    
    const desembarque = filteredRecords
      .filter((r) => r.operationType === 'desembarque')
      .reduce((sum, r) => sum + r.passengers, 0);

    return {
      labels: ['Embarque', 'Desembarque'],
      datasets: [
        {
          label: 'Quantidade de Passageiros',
          data: [embarque, desembarque],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [filteredRecords]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Histórico de Passageiros',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('pt-BR')}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => value.toLocaleString('pt-BR'),
        },
      },
    },
  };

  if (records.length === 0) {
    return (
      <div className="passenger-chart-container">
        <div className="chart-empty">
          <p>Nenhum dado disponível para exibir o gráfico.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="passenger-chart-container">
      <div className="chart-filters">
        <button
          className={`filter-button ${timeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTimeFilter('all')}
        >
          Todos os Registros
        </button>
        <button
          className={`filter-button ${timeFilter === 'today' ? 'active' : ''}`}
          onClick={() => setTimeFilter('today')}
        >
          Hoje
        </button>
        <button
          className={`filter-button ${timeFilter === 'week' ? 'active' : ''}`}
          onClick={() => setTimeFilter('week')}
        >
          Esta Semana
        </button>
        <button
          className={`filter-button ${timeFilter === 'month' ? 'active' : ''}`}
          onClick={() => setTimeFilter('month')}
        >
          Este Mês
        </button>
      </div>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total de Passageiros:</span>
          <span className="summary-value">
            {chartData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Embarques:</span>
          <span className="summary-value">
            {chartData.datasets[0].data[0].toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Desembarques:</span>
          <span className="summary-value">
            {chartData.datasets[0].data[1].toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
};

