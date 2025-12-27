export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  profile: 'admin' | 'guest';
}

export interface Vessel {
  id?: string;
  name: string;
  createdAt?: string;
  createdBy?: string;
}

export interface VesselRecord {
  id?: string;
  vesselName: string;
  operationType: 'embarque' | 'desembarque';
  date: string;
  time: string;
  passengers: number;
  createdAt?: string;
  createdBy?: string;
}

export type OperationType = 'embarque' | 'desembarque';

