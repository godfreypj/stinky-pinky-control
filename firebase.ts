// src/firebase.ts

import * as admin from 'firebase-admin';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new SecretManagerServiceClient();

async function getFirebaseServiceAccountKey() {
  const projectEnv = process.env.PROJECT_ENV; 

  if (projectEnv === 'local') {
    // Retrieve the key from the environment variable in local development
    const keyJson = process.env.STINKY_PINKY_FIREBASE_KEY;
    if (!keyJson) {
      throw new Error('STINKY_PINKY_FIREBASE_KEY environment variable not set in local environment');
    }
    return JSON.parse(keyJson);
  } else {
    // Retrieve the key from Secret Manager in deployed environments
    try {
      const [version] = await client.accessSecretVersion({
        name: `projects/${process.env.PROJECT_ID}/secrets/STINKY_PINKY_FIREBASE_KEY/versions/latest`,
      });
      const payload = version.payload?.data?.toString();
      if (!payload) {
        throw new Error('Secret payload is empty or undefined');
      }
      return JSON.parse(payload);
    } catch (error) {
      throw error;
    }
  }
}

// Declare db outside the function
let db: FirebaseFirestore.Firestore;

// Export the initializeFirebase function
export async function initializeFirebase() {
  const serviceAccountKey = await getFirebaseServiceAccountKey();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
  db = admin.firestore();
}

export { db };