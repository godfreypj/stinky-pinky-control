// src/services/round/cancelRound.ts

import { Config } from '../../interfaces/config';
import { FirebaseError } from '../../utils/errors';
import { WriteResult } from 'firebase-admin/firestore';

/**
 * Cancels a round by marking it as inactive in the database.
 *
 * @param threadsApiResponseId - The ID of the Threads API response associated with the round.
 * @param config - The application's configuration.
 * @throws FirebaseError if there's an issue updating the database.
 */
export const cancelRound = async (
  threadsApiResponseId: string,
  config: Config
): Promise<WriteResult> => {
  const roundCollection = config.roundCollection;
  const database = config.db;

  try {
    const snapshot = await database
      .collection(roundCollection)
      .where('threadsApiResponseId', '==', threadsApiResponseId)
      .get();

    if (snapshot.empty) {
      throw new FirebaseError(
        `No round found with threadsApiResponseId: ${threadsApiResponseId}`
      );
    }

    // Update the 'active' field to false for the found document
    const docRef = snapshot.docs[0].ref;
    const update = await docRef.update({ active: false });

    return update;
  } catch (error) {
    throw new FirebaseError('Error cancelling round: ' + error);
  }
};