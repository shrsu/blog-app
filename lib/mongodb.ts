import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("Please add MONGODB_URI to .env.local");
  }
  if (clientPromise) return clientPromise;
  if (process.env.NODE_ENV === "development") {
    const g = globalThis as { _mongoClientPromise?: Promise<MongoClient> };
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri, options).connect();
    }
    clientPromise = g._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

async function getDb() {
  const c = await getClientPromise();
  return c.db();
}

export { getDb };
export default getDb;
