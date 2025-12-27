import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { VesselRecord, OperationType, Vessel } from '../types';
import './EditVesselModal.css';

interface EditVesselModalProps {
  record: VesselRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<VesselRecord, 'id' | 'createdAt' | 'createdBy'>) => void;
  vessels: Vessel[];
}

export const EditVesselModal = ({ record, isOpen, onClose, onSave, vessels }: EditVesselModalProps) => {
  const [formData, setFormData] = useState({
    vesselName: record.vesselName,
    operationType: record.operationType,
    date: record.date,
    time: record.time,
    passengers: record.passengers.toString(),
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        vesselName: record.vesselName,
        operationType: record.operationType,
        date: record.date,
        time: record.time,
        passengers: record.passengers.toString(),
      });
    }
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.vesselName.trim()) {
      alert('Por favor, informe o nome da embarcação.');
      return;
    }

    if (!formData.date) {
      alert('Por favor, informe a data.');
      return;
    }

    if (!formData.time) {
      alert('Por favor, informe o horário.');
      return;
    }

    const passengers = parseInt(formData.passengers);
    if (isNaN(passengers) || passengers < 0) {
      alert('Por favor, informe uma quantidade válida de passageiros.');
      return;
    }

    onSave({
      vesselName: formData.vesselName.trim(),
      operationType: formData.operationType,
      date: formData.date,
      time: formData.time,
      passengers,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Registro</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="vessel-form">
          <div className="form-group">
            <label htmlFor="edit-vesselName">Nome da Embarcação *</label>
            <select
              id="edit-vesselName"
              value={formData.vesselName}
              onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
              required
            >
              <option value="">Selecione uma embarcação</option>
              {vessels.map((vessel) => (
                <option key={vessel.id} value={vessel.name}>
                  {vessel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-operationType">Tipo de Operação *</label>
            <select
              id="edit-operationType"
              value={formData.operationType}
              onChange={(e) => setFormData({ ...formData, operationType: e.target.value as OperationType })}
              required
            >
              <option value="embarque">Embarque</option>
              <option value="desembarque">Desembarque</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-date">Data *</label>
              <input
                type="date"
                id="edit-date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-time">Horário *</label>
              <input
                type="time"
                id="edit-time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-passengers">Quantidade de Passageiros *</label>
            <input
              type="number"
              id="edit-passengers"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
              required
              min="0"
              placeholder="0"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="save-button">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

