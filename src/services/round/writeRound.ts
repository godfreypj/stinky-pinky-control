import { Round } from '../../interfaces/round';
import { Config } from '../../interfaces/config'
import { FirebaseError } from '../../utils/errors';
import { DocumentData, DocumentReference } from 'firebase-admin/firestore';

/**
 * Given a unique round and the config, write it to the database.
 * 
 * @param Round - A unique round (to the given environment).
 * @param Config - The applications configuration.
 * @returns DocumentReference - A doc id indicating successful write to the database.
 * @throws FirebaseError if there's an issue writing to the db
 */
export const writeRound = async (round: Round, config: Config): Promise<DocumentReference<DocumentData, DocumentData>> => {

    const roundCollection = config.roundCollection;
    const database = config.db;

    try {
        const docRef = await database.collection(roundCollection).add(round);
        return docRef
      } catch (error) {
        throw new FirebaseError("Error adding document: " + error);
      }

}