import { MongoClient, Db } from 'mongodb';

interface GlobalWithMongo extends Global {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: GlobalWithMongo;

interface MongoConfig {
  maxPoolSize: number;
  serverSelectionTimeoutMS: number;
  connectTimeoutMS: number;
  socketTimeoutMS: number;
  maxIdleTimeMS: number;
  retryWrites: boolean;
  retryReads: boolean;
}

const defaultMongoConfig: MongoConfig = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
};

function sanitizeMongoUri(uri: string): string {
  try {
    const url = new URL(uri);
    // Clean up query parameters
    const params = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (value) params.append(key, value);
    });
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

async function createMongoClient(): Promise<MongoClient> {
  const config = defaultMongoConfig;
  const client = new MongoClient(uri, {
    maxPoolSize: config.maxPoolSize,
    serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
    connectTimeoutMS: config.connectTimeoutMS,
    socketTimeoutMS: config.socketTimeoutMS,
    maxIdleTimeMS: config.maxIdleTimeMS,
    retryWrites: config.retryWrites,
    retryReads: config.retryReads,
  });

  let attempts = 0;
  const maxAttempts = 3;
  const retryDelay = 1000;

  while (attempts < maxAttempts) {
    try {
      await client.connect();
      console.log('Successfully connected to MongoDB');
      return client;
    } catch (error) {
      attempts++;
      console.error(`MongoDB connection attempt ${attempts} failed:`, error);
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to connect to MongoDB after ${maxAttempts} attempts: ${error}`);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
    }
  }

  throw new Error('Unexpected error in MongoDB connection');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createMongoClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createMongoClient();
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

    // Enhanced error handling with specific error types
    if (err instanceof Error) {
      if (err.message.includes('authentication failed')) {
        throw new AuthenticationError('MongoDB authentication failed. Please check your credentials.', err);
      } else if (err.message.includes('connection timed out') || err.message.includes('timeout')) {
        throw new TimeoutError('MongoDB connection timed out. Please check your network connection.', err);
      } else if (err.message.includes('ECONNREFUSED') || err.message.includes('getaddrinfo ENOTFOUND')) {
        throw new ConnectionError('Failed to connect to MongoDB. Please check your connection string and network.', err);
      }
    }

    throw new MongoDBError(
      'Failed to connect to MongoDB. Please check your connection string and network.',
      'CONNECTION_ERROR',
      err instanceof Error ? err : undefined
    );
  }
}

export async function healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  try {
    const { db } = await connectToDatabase();

    // Test database operations
    const collections = await db.collections();

    return {
      status: 'healthy',
      message: `MongoDB is healthy. Connected to database: ${dbName}, ${collections.length} collections found.`
    };
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return {
      status: 'unhealthy',
      message: `MongoDB health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    const client = await clientPromise;
    await client.close();
    console.log('Successfully disconnected from MongoDB');

    // Clear global promise in development
    if (process.env.NODE_ENV === 'development' && global._mongoClientPromise) {
      delete global._mongoClientPromise;
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw new Error(`Failed to disconnect from MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getConnectionStatus(): Promise<{
  connected: boolean;
  readyState: number;
  name: string | null;
  host: string | null;
  isPrimary: boolean;
}> {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    return {
      connected: true,
      readyState: 1, // Connected
      name: db.databaseName,
      host: client.options.hosts?.[0]?.host || null,
      isPrimary: true // Simplified for this implementation
    };
  } catch {
    return {
      connected: false,
      readyState: 0, // Disconnected
      name: null,
      host: null,
      isPrimary: false
    };
  }
}

export class MongoDBError extends Error {
  public code: string;
  public originalError?: Error;

  constructor(message: string, code: string, originalError?: Error) {
    super(message);
    this.name = 'MongoDBError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class ConnectionError extends MongoDBError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CONNECTION_ERROR', originalError);
    this.name = 'ConnectionError';
  }
}

export class TimeoutError extends MongoDBError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TIMEOUT_ERROR', originalError);
    this.name = 'TimeoutError';
  }
}

export class AuthenticationError extends MongoDBError {
  constructor(message: string, originalError?: Error) {
    super(message, 'AUTHENTICATION_ERROR', originalError);
    this.name = 'AuthenticationError';
  }
}

export async function initializeDatabase(): Promise<void> {
  try {
    const { db } = await connectToDatabase();

    // Create indexes for common collections if they don't exist
    const collections = ['users', 'products', 'orders', 'carts'];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);

      // Check if collection exists, if not it will be created when first document is inserted
      try {
        await collection.stats();
      } catch {
        console.log(`Collection ${collectionName} will be created on first insert`);
      }
    }

    // Create specific indexes
    await Promise.all([
      // Users collection indexes
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('users').createIndex({ role: 1 }),
      db.collection('users').createIndex({ createdAt: 1 }),

      // Products collection indexes
      db.collection('products').createIndex({ sellerId: 1 }),
      db.collection('products').createIndex({ category: 1 }),
      db.collection('products').createIndex({ price: 1 }),
      db.collection('products').createIndex({ createdAt: -1 }),
      db.collection('products').createIndex({ status: 1 }),

      // Orders collection indexes
      db.collection('orders').createIndex({ buyerId: 1 }),
      db.collection('orders').createIndex({ sellerId: 1 }),
      db.collection('orders').createIndex({ status: 1 }),
      db.collection('orders').createIndex({ createdAt: -1 }),

      // Carts collection indexes
      db.collection('carts').createIndex({ userId: 1 }, { unique: true }),
    ]);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw new MongoDBError(
      `Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'INITIALIZATION_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}
