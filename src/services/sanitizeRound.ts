// src/services/sanitizeRound.ts

import { db } from '../../firebase';
import { Round } from '../interfaces/round';

/**
 * Checks if a given round is unique within a specified Firestore collection.
 * 
 * @param Round - The Round object to check for uniqueness.
 * @param collectionName - The name of the Firestore collection to query, based on environment.
 * @returns Boolean that resolves to `true` if the round is unique, `false` otherwise.
 * @throws An error if there's an issue querying Firestore.
 */
export const isRoundUnique = async (round: Round, collectionName: string): Promise<boolean> => {
    try {
        // Query for documents where either word matches in either position
        const querySnapshot = await db.collection(collectionName)
        .where('word1', '==', round.word1)
        .where('word2', '==', round.word2)
        .get();
  
      if (!querySnapshot.empty) return true;
  
      const querySnapshot2 = await db.collection(collectionName)
        .where('word1', '==', round.word2)
        .where('word2', '==', round.word1)
        .get();
  
      return !querySnapshot2.empty;
    
    } catch (error) {
        throw new Error('Error sanitizing round: ' + error);
    }
};
