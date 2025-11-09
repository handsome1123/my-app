import { MongoClient, Db } from 'mongodb';

interface GlobalWithMongo extends Global {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: GlobalWithMongo;

function sanitizeMongoUri(uri: string): string {
  try {
    const url = new URL(uri);
    // Clean up query parameters
    const params = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (value) params.append(key, value);
    }
    url.search = params.toString();
    return url.toString();
  } catch (err) {
    throw new Error(`Invalid MongoDB URI format: ${err}`);
  }
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error('MongoDB URI not found in environment variables');
  throw new Error('MongoDB URI not found in environment variables');
}

const uri = sanitizeMongoUri(MONGODB_URI);
const dbName = process.env.MONGODB_DB || 'secondhandmfu';

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Verify connection with a simple command
    await db.command({ ping: 1 });

    return { client, db };
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw new Error('Failed to connect to MongoDB. Please check your connection string and network.');
  }
}
