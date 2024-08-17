import { db } from '../../firebase';
import { Round } from '../interfaces/round';


export const roundExists = async (round: Round, collectionName: string): Promise<boolean> => {
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
        throw error;
    }
};
