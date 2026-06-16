import mongoose from "mongoose";

declare global {
  var _mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_ATLAS_URL;

  if (!uri) {
    throw new Error("MONGO_ATLAS_URL is not defined in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  console.log("[MongoDB] Connected");
  return cached.conn;
}
