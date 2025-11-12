import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

let _adminInstance = null;
let _dbInstance = null;

function loadCredential() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey && privateKey.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
      return admin.credential.cert({ projectId, clientEmail, privateKey });
    }
  } catch {}
  try {
    const serviceAccount = require("../../serviceAccountKey.json");
    return admin.credential.cert(serviceAccount);
  } catch {
    throw new Error("Firebase Admin credentials not configured");
  }
}

export function getAdmin() {
  if (!_adminInstance) {
    const credential = loadCredential();
    _adminInstance = admin.apps.length ? admin.app() : admin.initializeApp({ credential });
    _dbInstance = admin.firestore();
  }
  return { admin: _adminInstance, db: _dbInstance };
}
