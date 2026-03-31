import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(process.env.MONGO_DB_NAME || "pdp");
  return cachedDb;
}

