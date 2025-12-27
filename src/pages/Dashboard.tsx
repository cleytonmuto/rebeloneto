import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { VesselRecord } from '../types';
import { VesselForm } from '../components/VesselForm';
import { VesselList } from '../components/VesselList';
import './Dashboard.css';

export const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [records, setRecords] = useState<VesselRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
          <h2>Novo Registro</h2>
          <VesselForm onSubmit={handleAddRecord} />
        </div>

        <div className="list-section">
          <h2>Registros ({records.length})</h2>
          {loading ? (
            <div className="loading">Carregando registros...</div>
          ) : (
            <VesselList records={records} />
          )}
        </div>
      </div>
    </div>
  );
};

