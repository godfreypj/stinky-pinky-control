import { Round } from '../../interfaces/round';
import { Config } from '../../interfaces/config'
import { FirebaseError } from '../../utils/errors';
import { DbObject } from '../../interfaces/dbObject';
import { postThreadsCont } from '../threads/postThreadsCont';
import { postThread } from '../threads/postThread';

/**
 * Given a unique round and the config, write it to the database.
 * 
 * @param Round - A unique round (to the given environment).
 * @param Config - The applications configuration.
 * @returns string - A doc id indicating successful write to the database.
 * @throws FirebaseError if there's an issue writing to the db
 */
export const writeRound = async (round: Round, config: Config): Promise<string> => {

    const roundCollection = config.roundCollection;
    const database = config.db;

    // Create a threads container
    const threadsContainerResponse = await postThreadsCont(round, config)
    // Post the thread
    const threadsPostResponseId = await postThread(threadsContainerResponse, config)

    const dbObject: DbObject = {
        round: round,
        active: true,
        threadsApiResponseId: threadsPostResponseId
    }

    try {
        const docRef = await database.collection(roundCollection).add(dbObject);
        console.log('Successful write to database: ', docRef.id)
        return docRef.id
      } catch (error) {
        throw new FirebaseError("Error adding document: " + error);
      }
}