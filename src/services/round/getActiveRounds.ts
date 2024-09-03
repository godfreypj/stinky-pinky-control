// src/services/round/getActiveRounds.ts

import { FirebaseError } from '../../utils/errors';
import { DbObject } from '../../interfaces/dbObject';
import { Firestore } from 'firebase-admin/firestore';

/**
 * Get all active rounds from the database.
 * 
 * @param roundCollection - The name of the collection storing rounds.
 * @param db - The Firestore database instance.
 * @returns An array of active round objects (DbObject).
 * @throws FirebaseError if there's an issue fetching from the database.
 */
export const getActiveRounds = async (
  roundCollection: string,
  db: Firestore
): Promise<DbObject[]> => {
    try {
    const snapshot = await db.collection(roundCollection).where('active', '==', true).get();

    const activeRounds: DbObject[] = [];
    snapshot.forEach((doc) => {
        activeRounds.push(doc.data() as DbObject); 
    });

    return activeRounds;
    } catch (error) {
    throw new FirebaseError("Error fetching active rounds: " + error);
    }
};