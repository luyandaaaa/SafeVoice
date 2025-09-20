import { getDb } from '../config/db';
import { ObjectId, Collection } from 'mongodb';

// Types
interface Location {
  type: string;
  coordinates: [number, number];
}

interface Consent {
  vault: boolean;
  ngo: boolean;
  court: boolean;
}

interface Incident {
  _id?: ObjectId;
  userId: ObjectId;
  type: string;
  urgency: string;
  date: string;
  time: string;
  location: Location;
  description: string;
  perpetrator?: string;
  witnesses?: string;
  notes?: string;
  anonymous: boolean;
  consent: Consent;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IncidentInput {
  userId: string;
  type: string;
  urgency: string;
  date: string;
  time: string;
  location: Location;
  description: string;
  perpetrator?: string;
  witnesses?: string;
  notes?: string;
  anonymous?: boolean;
  consent?: Consent;
  status?: string;
}

// Database setup
const db = getDb();
const incidents: Collection<Incident> = db.collection('incidents');

// Create indexes
incidents.createIndex({ location: '2dsphere' })
  .then(() => incidents.createIndex({ userId: 1 }))
  .then(() => console.log('Incident indexes created'))
  .catch(err => console.error('Index error:', err));

// Database operations
export async function create(data: IncidentInput): Promise<Incident> {
  const incident: Incident = {
    userId: new ObjectId(data.userId),
    type: data.type,
    urgency: data.urgency,
    date: data.date,
    time: data.time,
    location: data.location,
    description: data.description,
    perpetrator: data.perpetrator || '',
    witnesses: data.witnesses || '',
    notes: data.notes || '',
    anonymous: data.anonymous || false,
    consent: data.consent || { vault: false, ngo: false, court: false },
    status: data.status || 'submitted',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await incidents.insertOne(incident);
  return { ...incident, _id: result.insertedId };
}

export async function findById(id: string): Promise<Incident | null> {
  return await incidents.findOne({ _id: new ObjectId(id) });
}

export async function findByUserId(userId: string): Promise<Incident[]> {
  return await incidents
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateById(id: string, data: Partial<IncidentInput>): Promise<Incident | null> {
  const updateData: Partial<Incident> = {
    ...(data.type && { type: data.type }),
    ...(data.urgency && { urgency: data.urgency }),
    ...(data.date && { date: data.date }),
    ...(data.time && { time: data.time }),
    ...(data.location && { location: data.location }),
    ...(data.description && { description: data.description }),
    ...(data.perpetrator && { perpetrator: data.perpetrator }),
    ...(data.witnesses && { witnesses: data.witnesses }),
    ...(data.notes && { notes: data.notes }),
    ...(typeof data.anonymous !== 'undefined' && { anonymous: data.anonymous }),
    ...(data.consent && { consent: data.consent }),
    ...(data.status && { status: data.status }),
    ...(data.userId && { userId: new ObjectId(data.userId) }),
    updatedAt: new Date()
  };

  return await incidents.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after' }
  );
}

export async function deleteById(id: string): Promise<boolean> {
  const result = await incidents.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}