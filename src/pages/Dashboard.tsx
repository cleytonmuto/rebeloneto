import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { VesselRecord, Vessel } from '../types';
import { VesselForm } from '../components/VesselForm';
import { VesselList } from '../components/VesselList';
import { EditVesselModal } from '../components/EditVesselModal';
import { VesselManagement } from '../components/VesselManagement';
import { Tabs } from '../components/Tabs';
import { exportToExcel, exportToPDF } from '../utils/exportReports';
import './Dashboard.css';

export const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [records, setRecords] = useState<VesselRecord[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<VesselRecord | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'vesselRecords'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData: VesselRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        recordsData.push({
          id: doc.id,
          vesselName: data.vesselName,
          operationType: data.operationType,
          date: data.date,
          time: data.time,
          passengers: data.passengers,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          createdBy: data.createdBy,
        });
      });
      // Ordenar por data e depois por horário
      recordsData.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      });
      setRecords(recordsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    });

    return () => unsubscribe();
  }, []);

  const handleAddRecord = async (record: Omit<VesselRecord, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      await addDoc(collection(db, 'vesselRecords'), {
        ...record,
        createdAt: Timestamp.now(),
        createdBy: currentUser?.uid || '',
      });
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Erro ao adicionar registro. Tente novamente.');
    }
  };

  const handleEditRecord = (record: VesselRecord) => {
    setEditingRecord(record);
  };

  const handleUpdateRecord = async (record: Omit<VesselRecord, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!editingRecord?.id) return;

    try {
      const recordRef = doc(db, 'vesselRecords', editingRecord.id);
      await updateDoc(recordRef, {
        ...record,
      });
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Erro ao atualizar registro. Tente novamente.');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const recordRef = doc(db, 'vesselRecords', recordId);
      await deleteDoc(recordRef);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Erro ao excluir registro. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleExportExcel = () => {
    if (records.length === 0) {
      alert('Não há registros para exportar.');
      return;
    }
    const filename = `relatorio_embarcacoes_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(records, filename);
  };

  const handleExportPDF = () => {
    if (records.length === 0) {
      alert('Não há registros para exportar.');
      return;
    }
    const filename = `relatorio_embarcacoes_${new Date().toISOString().split('T')[0]}`;
    exportToPDF(records, filename);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Controle de Embarcações Hidroviárias</h1>
          <p className="user-info">
            {currentUser?.displayName || currentUser?.email} 
            {currentUser?.profile === 'admin' && <span className="admin-badge">Admin</span>}
          </p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </header>

      <div className="dashboard-content">
        <div className="form-section">
          <Tabs
            tabs={[
              {
                id: 'new-record',
                label: 'Novo Registro',
                content: (
                  <div>
                    <h2 style={{ marginTop: 0 }}>Novo Registro</h2>
                    <VesselForm onSubmit={handleAddRecord} vessels={vessels} />
                  </div>
                ),
              },
              {
                id: 'manage-vessels',
                label: 'Gerenciar Embarcações',
                content: <VesselManagement />,
              },
            ]}
            defaultTab="new-record"
          />
        </div>

        <div className="list-section">
          <div className="list-section-header">
            <h2>Registros ({records.length})</h2>
            <div className="export-buttons">
              <button
                onClick={handleExportExcel}
                className="export-button export-excel"
                disabled={records.length === 0}
                title="Exportar para Excel"
              >
                📊 Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="export-button export-pdf"
                disabled={records.length === 0}
                title="Exportar para PDF"
              >
                📄 PDF
              </button>
            </div>
          </div>
          {loading ? (
            <div className="loading">Carregando registros...</div>
          ) : (
            <VesselList 
              records={records} 
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
            />
          )}
        </div>
      </div>

      {editingRecord && (
        <EditVesselModal
          record={editingRecord}
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleUpdateRecord}
          vessels={vessels}
        />
      )}
    </div>
  );
};

