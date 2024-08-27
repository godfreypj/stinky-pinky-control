// src/services/sanitizeRound.ts

import { db } from '../../../firebase';
import { Round } from '../../interfaces/round';
import { FirebaseError } from '../../utils/errors';

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
            .where('round.word1', '==', round.word1)
            .where('round.word2', '==', round.word2)
            .get();

        const querySnapshot2 = await db.collection(collectionName)
            .where('round.word1', '==', round.word2)
            .where('round.word2', '==', round.word1)
            .get();

        // Return true only if BOTH queries are empty (no matches found)
        if (querySnapshot.empty && querySnapshot2.empty) {
            console.log("Successfully created new Round: " + round.toString)
            return true;
        }
    } catch (error) {
        throw new FirebaseError('Error sanitizing round: ' + error);
    }
};
