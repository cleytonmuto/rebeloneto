import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Vessel } from '../types';
import { useAuth } from '../contexts/AuthContext';
import './VesselManagement.css';

export const VesselManagement = () => {
  const { currentUser } = useAuth();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [newVesselName, setNewVesselName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  useEffect(() => {
    const q = query(collection(db, 'vessels'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vesselsData: Vessel[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vesselsData.push({
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          createdBy: data.createdBy,
        });
      });
      setVessels(vesselsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddVessel = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newVesselName.trim()) {
      alert('Por favor, informe o nome da embarcação.');
      return;
    }

    // Verificar se já existe
    const exists = vessels.some(v => v.name.toLowerCase() === newVesselName.trim().toLowerCase());
    if (exists) {
      alert('Esta embarcação já está cadastrada.');
      return;
    }

    try {
      await addDoc(collection(db, 'vessels'), {
        name: newVesselName.trim(),
        createdAt: Timestamp.now(),
        createdBy: currentUser?.uid || '',
      });
      setNewVesselName('');
    } catch (error) {
      console.error('Error adding vessel:', error);
      alert('Erro ao adicionar embarcação. Tente novamente.');
    }
  };

  const handleEditVessel = (vessel: Vessel) => {
    setEditingId(vessel.id || null);
    setEditingName(vessel.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (vesselId: string) => {
    if (!editingName.trim()) {
      alert('Por favor, informe o nome da embarcação.');
      return;
    }

    // Verificar se já existe (exceto a que está sendo editada)
    const exists = vessels.some(
      v => v.id !== vesselId && v.name.toLowerCase() === editingName.trim().toLowerCase()
    );
    if (exists) {
      alert('Esta embarcação já está cadastrada.');
      return;
    }

    try {
      const vesselRef = doc(db, 'vessels', vesselId);
      await updateDoc(vesselRef, {
        name: editingName.trim(),
      });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error updating vessel:', error);
      alert('Erro ao atualizar embarcação. Tente novamente.');
    }
  };

  const handleDeleteVessel = async (vesselId: string, vesselName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a embarcação "${vesselName}"?`)) {
      try {
        const vesselRef = doc(db, 'vessels', vesselId);
        await deleteDoc(vesselRef);
      } catch (error) {
        console.error('Error deleting vessel:', error);
        alert('Erro ao excluir embarcação. Tente novamente.');
      }
    }
  };

  return (
    <div className="vessel-management">
      <form onSubmit={handleAddVessel} className="add-vessel-form">
        <div className="form-group">
          <input
            type="text"
            value={newVesselName}
            onChange={(e) => setNewVesselName(e.target.value)}
            placeholder="Nome da embarcação"
            required
          />
          <button type="submit" className="add-button">
            Adicionar
          </button>
        </div>
      </form>

      <div className="vessels-list">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : vessels.length === 0 ? (
          <div className="empty-state">Nenhuma embarcação cadastrada</div>
        ) : (
          vessels.map((vessel) => (
            <div key={vessel.id} className="vessel-item">
              {editingId === vessel.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="edit-vessel-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(vessel.id!);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <div className="vessel-edit-actions">
                    <button
                      className="save-vessel-button"
                      onClick={() => handleSaveEdit(vessel.id!)}
                      title="Salvar"
                    >
                      Salvar
                    </button>
                    <button
                      className="cancel-vessel-button"
                      onClick={handleCancelEdit}
                      title="Cancelar"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="vessel-name">{vessel.name}</span>
                  <div className="vessel-actions">
                    <button
                      className="edit-vessel-button"
                      onClick={() => handleEditVessel(vessel)}
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="delete-vessel-button"
                      onClick={() => handleDeleteVessel(vessel.id!, vessel.name)}
                      title="Excluir"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

