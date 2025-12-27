import { useState, FormEvent } from 'react';
import { VesselRecord, OperationType } from '../types';
import './VesselForm.css';

interface VesselFormProps {
  onSubmit: (record: Omit<VesselRecord, 'id' | 'createdAt' | 'createdBy'>) => void;
}

export const VesselForm = ({ onSubmit }: VesselFormProps) => {
  const [formData, setFormData] = useState({
    vesselName: '',
    operationType: 'embarque' as OperationType,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    passengers: '',
  });

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

    onSubmit({
      vesselName: formData.vesselName.trim(),
      operationType: formData.operationType,
      date: formData.date,
      time: formData.time,
      passengers,
    });

    // Reset form
    setFormData({
      vesselName: '',
      operationType: 'embarque',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      passengers: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="vessel-form">
      <div className="form-group">
        <label htmlFor="vesselName">Nome da Embarcação *</label>
        <input
          type="text"
          id="vesselName"
          value={formData.vesselName}
          onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
          required
          placeholder="Ex: Balsa Rio Grande"
        />
      </div>

      <div className="form-group">
        <label htmlFor="operationType">Tipo de Operação *</label>
        <select
          id="operationType"
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
          <label htmlFor="date">Data *</label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Horário *</label>
          <input
            type="time"
            id="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="passengers">Quantidade de Passageiros *</label>
        <input
          type="number"
          id="passengers"
          value={formData.passengers}
          onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
          required
          min="0"
          placeholder="0"
        />
      </div>

      <button type="submit" className="submit-button">
        Registrar
      </button>
    </form>
  );
};

