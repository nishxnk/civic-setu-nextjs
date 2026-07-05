import { initializeApp, cert, getApp, getApps, App } from "firebase-admin/app";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import path from "path";
import fs from "fs";

let firebaseApp: App | null = null;

function getOrInitApp(): App {
  if (firebaseApp) return firebaseApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  const keyPath = path.join(process.cwd(), "src/lib/serviceAccountKey.json");

  if (fs.existsSync(keyPath)) {
    firebaseApp = initializeApp({
      credential: cert(keyPath),
    });
    console.log("[Firebase] Admin SDK initialized with service account");
  } else {
    console.warn(
      "[Firebase] No serviceAccountKey.json found. Using Application Default Credentials."
    );
    firebaseApp = initializeApp();
  }

  return firebaseApp;
}

export function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const auth = getAuth(getOrInitApp());
  return auth.verifyIdToken(token);
}

export async function createFirebaseUser(
  email: string,
  password: string,
  displayName: string
): Promise<{ uid: string }> {
  const auth = getAuth(getOrInitApp());
  const userRecord = await auth.createUser({
    email,
    password,
    displayName,
    emailVerified: false,
  });
  return { uid: userRecord.uid };
}

