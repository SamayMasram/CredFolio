import { MongoClient, Db, ObjectId, Binary } from 'mongodb';
import { Certificate, CertificateType, UserProfile, ProfileVisibility } from '@/types';

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
 * Stores a binary file (PDF or Image) into MongoDB media_files collection.
 * Safe limit is 14MB to account for BSON document overhead.
 */
const SAFE_BSON_LIMIT = 14 * 1024 * 1024; // 14MB — leaves room for BSON overhead within the 16MB doc limit

export async function storeMediaFile({
  filename,
  contentType,
  buffer,
}: {
  filename: string;
  contentType: string;
  buffer: Buffer;
}): Promise<string> {
  if (buffer.length > SAFE_BSON_LIMIT) {
    throw new Error(
      `File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds the safe storage limit of ${(SAFE_BSON_LIMIT / (1024 * 1024)).toFixed(0)}MB.`
    );
  }

  const db = await getMongoDb();
  const collection = db.collection<MediaFileDocument>('media_files');

  const doc: MediaFileDocument = {
    filename: filename || 'file',
    contentType: contentType || 'application/octet-stream',
    size: buffer.length,
    data: new Binary(buffer),
    created_at: new Date().toISOString(),
  };

  try {
    const result = await collection.insertOne(doc);
    return result.insertedId.toString();
  } catch (err: any) {
    console.error('MongoDB insertOne failed for media file:', err);
    throw new Error(`Failed to store file in MongoDB: ${err.message || 'Unknown database error'}`);
  }
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

    // Correctly extract buffer from MongoDB Binary (mongodb@7.x driver)
    let buffer: Buffer;
    if (Buffer.isBuffer(fileDoc.data)) {
      buffer = fileDoc.data;
    } else if (fileDoc.data instanceof Binary) {
      // mongodb@7.x: Binary.buffer is a Uint8Array
      buffer = Buffer.from(fileDoc.data.buffer);
    } else if (fileDoc.data && typeof (fileDoc.data as any).buffer === 'function') {
      // Legacy fallback: some Binary versions expose .buffer() as a method
      buffer = Buffer.from((fileDoc.data as any).buffer());
    } else if (fileDoc.data && (fileDoc.data as any).buffer instanceof Uint8Array) {
      buffer = Buffer.from((fileDoc.data as any).buffer);
    } else {
      // Last resort — try direct conversion
      buffer = Buffer.from(fileDoc.data as any);
    }

    if (!buffer || buffer.length === 0) {
      console.error('Retrieved media file has empty buffer, id:', id);
      return null;
    }

    return {
      filename: fileDoc.filename,
      contentType: fileDoc.contentType,
      size: fileDoc.size || buffer.length,
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

/**
 * User Profile Storage in MongoDB
 */
export interface MongoProfileDocument {
  _id?: ObjectId;
  uid: string;
  username: string;
  full_name: string;
  headline?: string;
  bio?: string;
  avatar_url?: string | null;
  visibility: ProfileVisibility;
  created_at: string;
  updated_at: string;
}

export async function storeProfileInMongo(
  data: Partial<UserProfile> & { uid: string; username: string; full_name: string }
): Promise<UserProfile> {
  const db = await getMongoDb();
  const collection = db.collection<MongoProfileDocument>('profiles');
  const now = new Date().toISOString();

  const normalizedUsername = data.username.toLowerCase().trim();

  // Check if username is already taken by another user
  const existingUser = await collection.findOne({
    username: normalizedUsername,
    uid: { $ne: data.uid },
  });
  if (existingUser) {
    throw new Error('Username is already taken');
  }

  const profileDoc: Partial<MongoProfileDocument> = {
    uid: data.uid,
    username: normalizedUsername,
    full_name: data.full_name.trim(),
    headline: data.headline?.trim() || '',
    bio: data.bio?.trim() || '',
    avatar_url: data.avatar_url || null,
    visibility: (data.visibility as ProfileVisibility) || 'public',
    updated_at: now,
  };

  await collection.updateOne(
    { uid: data.uid },
    {
      $set: profileDoc,
      $setOnInsert: { created_at: now },
    },
    { upsert: true }
  );

  const saved = await collection.findOne({ uid: data.uid });
  return {
    uid: saved!.uid,
    username: saved!.username,
    full_name: saved!.full_name,
    headline: saved!.headline || '',
    bio: saved!.bio || '',
    avatar_url: saved!.avatar_url || undefined,
    visibility: saved!.visibility,
    created_at: saved!.created_at,
    updated_at: saved!.updated_at,
  };
}

export async function getProfileFromMongo(identifier: string): Promise<UserProfile | null> {
  try {
    if (!identifier) return null;
    const db = await getMongoDb();
    const collection = db.collection<MongoProfileDocument>('profiles');

    const clean = identifier.trim();
    const cleanLower = clean.toLowerCase();

    // Match either by uid or by username (case-insensitive)
    const doc = await collection.findOne({
      $or: [
        { uid: clean },
        { username: cleanLower },
        { username: clean },
      ],
    });

    if (!doc) return null;

    return {
      uid: doc.uid,
      username: doc.username,
      full_name: doc.full_name,
      headline: doc.headline || '',
      bio: doc.bio || '',
      avatar_url: doc.avatar_url || undefined,
      visibility: doc.visibility || 'public',
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  } catch (error) {
    console.error('Error fetching profile from MongoDB:', error);
    return null;
  }
}

export async function updateProfileInMongo(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const db = await getMongoDb();
  const collection = db.collection<MongoProfileDocument>('profiles');
  const now = new Date().toISOString();

  // If username is being updated, verify availability
  if (updates.username) {
    const normalizedUsername = updates.username.toLowerCase().trim();
    const existing = await collection.findOne({
      username: normalizedUsername,
      uid: { $ne: uid },
    });
    if (existing) {
      throw new Error('Username is already taken');
    }
  }

  const cleanUpdates: any = { ...updates, updated_at: now };
  if (cleanUpdates.username) {
    cleanUpdates.username = cleanUpdates.username.toLowerCase().trim();
  }
  if (cleanUpdates.full_name) {
    cleanUpdates.full_name = cleanUpdates.full_name.trim();
  }
  if (cleanUpdates.headline !== undefined) {
    cleanUpdates.headline = cleanUpdates.headline.trim();
  }
  if (cleanUpdates.bio !== undefined) {
    cleanUpdates.bio = cleanUpdates.bio.trim();
  }
  delete cleanUpdates.uid;
  delete cleanUpdates._id;

  await collection.updateOne(
    { $or: [{ uid }, { username: uid.toLowerCase().trim() }] },
    { $set: cleanUpdates, $setOnInsert: { created_at: now, uid } },
    { upsert: true }
  );

  const updatedDoc = await collection.findOne({
    $or: [{ uid }, { username: uid.toLowerCase().trim() }],
  });

  if (!updatedDoc) {
    throw new Error('Failed to retrieve updated profile from MongoDB');
  }

  return {
    uid: updatedDoc.uid,
    username: updatedDoc.username,
    full_name: updatedDoc.full_name,
    headline: updatedDoc.headline || '',
    bio: updatedDoc.bio || '',
    avatar_url: updatedDoc.avatar_url || undefined,
    visibility: updatedDoc.visibility || 'public',
    created_at: updatedDoc.created_at,
    updated_at: updatedDoc.updated_at,
  };
}

export async function checkUsernameAvailabilityInMongo(username: string, excludeUid?: string): Promise<boolean> {
  try {
    const clean = username.toLowerCase().trim();
    if (clean.length < 3) return false;

    const db = await getMongoDb();
    const collection = db.collection<MongoProfileDocument>('profiles');

    const query: any = { username: clean };
    if (excludeUid) {
      query.uid = { $ne: excludeUid };
    }

    const existing = await collection.findOne(query);
    return !existing;
  } catch (err) {
    console.warn('Error checking username in MongoDB:', err);
    return true;
  }
}

