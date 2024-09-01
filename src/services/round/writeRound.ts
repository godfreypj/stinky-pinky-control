import { Round } from '../../interfaces/round';
import { Config } from '../../interfaces/config'
import { FirebaseError } from '../../utils/errors';
import { DbObject } from '../../interfaces/dbObject';

/**
 * Given a unique round and the config, write it to the database.
 * 
 * @param Round - A unique round (to the given environment).
 * @param threadsApiResponse - The response from the threads api.
 * @param Config - The applications configuration.
 * @returns string - A doc id indicating successful write to the database.
 * @throws FirebaseError if there's an issue writing to the db
 */
export const writeRound = async (round: Round, threadsApiResponseId: string, config: Config): Promise<string> => {

    const roundCollection = config.roundCollection;
    const database = config.db;

    const dbObject: DbObject = {
        round: round,
        active: true,
        threadsApiResponseId: threadsApiResponseId
    }

    try {
        const docRef = await database.collection(roundCollection).add(dbObject);
        console.log('Successful write to database: ', docRef.id)
        return docRef.id
      } catch (error) {
        throw new FirebaseError("Error adding document: " + error);
      }
}