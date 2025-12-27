import type { VesselRecord } from '../types';
import './VesselList.css';

interface VesselListProps {
  records: VesselRecord[];
  onEdit: (record: VesselRecord) => void;
  onDelete: (recordId: string) => void;
}

export const VesselList = ({ records, onEdit, onDelete }: VesselListProps) => {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum registro encontrado.</p>
        <p className="empty-state-subtitle">Adicione um novo registro usando o formulário ao lado.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleDelete = (recordId: string, vesselName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o registro da embarcação "${vesselName}"?`)) {
      onDelete(recordId);
    }
  };

  return (
    <div className="vessel-list">
      {records.map((record) => (
        <div key={record.id} className="vessel-card">
          <div className="vessel-card-header">
            <div className="vessel-card-title">
              <h3>{record.vesselName}</h3>
              <span className={`operation-badge ${record.operationType}`}>
                {record.operationType === 'embarque' ? 'Embarque' : 'Desembarque'}
              </span>
            </div>
            <div className="vessel-card-actions">
              <button
                className="edit-button"
                onClick={() => onEdit(record)}
                title="Editar"
              >
                Editar
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(record.id!, record.vesselName)}
                title="Excluir"
              >
                Excluir
              </button>
            </div>
          </div>
          
          <div className="vessel-card-body">
            <div className="info-item">
              <span className="info-label">Data:</span>
              <span className="info-value">{formatDate(record.date)}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Horário:</span>
              <span className="info-value">{record.time}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Passageiros:</span>
              <span className="info-value">{record.passengers}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

