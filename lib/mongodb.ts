import { MongoClient, Db, ObjectId, Binary } from 'mongodb';
import { Certificate, CertificateType } from '@/types';

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const FALLBACK_LOCAL_URI = 'mongodb://127.0.0.1:27017/certilink';
const primaryUri = process.env.MONGODB_URI || (isProduction ? '' : FALLBACK_LOCAL_URI);

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function createConnectedClient(uri: string): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing on Vercel/Production.');
  }

  const isAtlas = uri.startsWith('mongodb+srv://');
  const mongoClient = new MongoClient(uri, {
    serverSelectionTimeoutMS: isAtlas ? 5000 : 3000,
  });

  try {
    await mongoClient.connect();
    return mongoClient;
  } catch (primaryErr) {
    if (!isProduction && isAtlas && uri !== FALLBACK_LOCAL_URI) {
      console.warn('MongoDB Atlas connection failed in dev, trying local fallback:', (primaryErr as Error).message);
      const fallbackClient = new MongoClient(FALLBACK_LOCAL_URI, { serverSelectionTimeoutMS: 3000 });
      await fallbackClient.connect();
      return fallbackClient;
    }
    throw primaryErr;
  }
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createConnectedClient(primaryUri);
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      clientPromise = createConnectedClient(primaryUri);
    }
    return clientPromise;
  }
}

export async function getMongoDb(): Promise<Db> {
  try {
    const client = await getMongoClientPromise();
    return client.db('certilink');
  } catch (err: any) {
    if (isProduction) {
      console.error('MongoDB Connection Error on Vercel/Production:', err.message);
      throw new Error(`MongoDB connection failed on Vercel. Ensure MONGODB_URI is set in Vercel Dashboard and Network Access (IP Whitelist 0.0.0.0/0) is configured in MongoDB Atlas. (${err.message})`);
    }
    console.error('getMongoDb error, attempting direct local connection fallback:', err.message);
    const localClient = new MongoClient(FALLBACK_LOCAL_URI, { serverSelectionTimeoutMS: 3000 });
    await localClient.connect();
    return localClient.db('certilink');
  }
}

export interface MediaFileDocument {
  _id?: ObjectId;
  filename: string;
  contentType: string;
  size: number;
  data: Binary | Buffer;
  created_at: string;
}

export interface MongoCertificateDocument {
  _id?: ObjectId;
  id?: string;
  profile_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url: string | null;
  file_url: string | null;
  type: CertificateType;
  category: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Stores a binary file (PDF or Image) into MongoDB media_files collection
 */
export async function storeMediaFile({
  filename,
  contentType,
  buffer,
}: {
  filename: string;
  contentType: string;
  buffer: Buffer;
}): Promise<string> {
  const db = await getMongoDb();
  const collection = db.collection<MediaFileDocument>('media_files');

  const doc: MediaFileDocument = {
    filename: filename || 'file',
    contentType: contentType || 'application/octet-stream',
    size: buffer.length,
    data: new Binary(buffer),
    created_at: new Date().toISOString(),
  };

  const result = await collection.insertOne(doc);
  return result.insertedId.toString();
}

/**
 * Retrieves a media file from MongoDB by string ID
 */
export async function getMediaFileById(id: string): Promise<{
  filename: string;
  contentType: string;
  size: number;
  buffer: Buffer;
  created_at: string;
} | null> {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const db = await getMongoDb();
    const collection = db.collection<MediaFileDocument>('media_files');

    const fileDoc = await collection.findOne({ _id: new ObjectId(id) });
    if (!fileDoc) return null;

    let buffer: Buffer;
    if (Buffer.isBuffer(fileDoc.data)) {
      buffer = fileDoc.data;
    } else if (fileDoc.data && typeof (fileDoc.data as any).buffer !== 'undefined') {
      buffer = Buffer.from((fileDoc.data as Binary).buffer);
    } else {
      buffer = Buffer.from(fileDoc.data as any);
    }

    return {
      filename: fileDoc.filename,
      contentType: fileDoc.contentType,
      size: fileDoc.size,
      buffer,
      created_at: fileDoc.created_at,
    };
  } catch (error) {
    console.error('Error fetching media file from MongoDB:', error);
    return null;
  }
}

/**
 * Certificate Storage in MongoDB
 */

export async function storeCertificateInMongo(certData: Partial<Certificate>): Promise<Certificate> {
  const db = await getMongoDb();
  const collection = db.collection<MongoCertificateDocument>('certificates');
  const now = new Date().toISOString();

  const docId = new ObjectId();
  const certDoc: MongoCertificateDocument = {
    _id: docId,
    id: docId.toString(),
    profile_id: certData.profile_id || '',
    title: (certData.title || '').trim(),
    issuer: (certData.issuer || '').trim(),
    issue_date: certData.issue_date || new Date().toISOString().split('T')[0],
    expiry_date: certData.expiry_date || null,
    credential_url: certData.credential_url || null,
    file_url: certData.file_url || null,
    type: certData.type || 'certificate',
    category: certData.category || 'Other',
    is_featured: certData.is_featured || false,
    sort_order: typeof certData.sort_order === 'number' ? certData.sort_order : 0,
    created_at: now,
    updated_at: now,
  };

  await collection.insertOne(certDoc);
  return {
    id: docId.toString(),
    ...certDoc,
  } as Certificate;
}

export async function getCertificatesFromMongo(profileId: string): Promise<Certificate[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<MongoCertificateDocument>('certificates');

    const docs = await collection
      .find({ profile_id: profileId })
      .sort({ sort_order: 1 })
      .toArray();

    return docs.map((doc) => ({
      id: doc.id || doc._id?.toString() || '',
      profile_id: doc.profile_id,
      title: doc.title,
      issuer: doc.issuer,
      issue_date: doc.issue_date,
      expiry_date: doc.expiry_date,
      credential_url: doc.credential_url,
      file_url: doc.file_url,
      type: doc.type,
      category: doc.category || 'Other',
      is_featured: doc.is_featured,
      sort_order: doc.sort_order,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching certificates from MongoDB:', error);
    return [];
  }
}

export async function updateCertificateInMongo(id: string, updates: Partial<Certificate>): Promise<Certificate> {
  const db = await getMongoDb();
  const collection = db.collection<MongoCertificateDocument>('certificates');
  const now = new Date().toISOString();

  const queryFilter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
  const cleanUpdates: any = { ...updates, updated_at: now };
  delete cleanUpdates.id;
  delete cleanUpdates._id;

  await collection.updateOne(queryFilter, { $set: cleanUpdates });

  const updatedDoc = await collection.findOne(queryFilter);
  if (!updatedDoc) {
    throw new Error('Certificate not found in MongoDB for update');
  }

  return {
    id: updatedDoc.id || updatedDoc._id?.toString() || id,
    profile_id: updatedDoc.profile_id,
    title: updatedDoc.title,
    issuer: updatedDoc.issuer,
    issue_date: updatedDoc.issue_date,
    expiry_date: updatedDoc.expiry_date,
    credential_url: updatedDoc.credential_url,
    file_url: updatedDoc.file_url,
    type: updatedDoc.type,
    category: updatedDoc.category || 'Other',
    is_featured: updatedDoc.is_featured,
    sort_order: updatedDoc.sort_order,
    created_at: updatedDoc.created_at,
    updated_at: updatedDoc.updated_at,
  };
}


export async function deleteCertificateFromMongo(id: string): Promise<void> {
  const db = await getMongoDb();
  const collection = db.collection<MongoCertificateDocument>('certificates');
  const queryFilter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
  await collection.deleteOne(queryFilter);
}

export async function reorderCertificatesInMongo(items: { id: string; sort_order: number }[]): Promise<void> {
  const db = await getMongoDb();
  const collection = db.collection<MongoCertificateDocument>('certificates');
  const now = new Date().toISOString();

  await Promise.all(
    items.map((item) => {
      if (!item.id) return Promise.resolve();
      const queryFilter = ObjectId.isValid(item.id) ? { _id: new ObjectId(item.id) } : { id: item.id };
      return collection.updateOne(queryFilter, { $set: { sort_order: item.sort_order, updated_at: now } });
    })
  );
}

