// src/services/threads/processReplies.ts

import { Config } from '../../interfaces/config';
import { cancelRound } from '../round/cancelRound';
import { getActiveRounds } from '../round/getActiveRounds';
import { getThreadReplies } from './getThreadReplies';
import { replyToWinner } from './replyToWinner';

/**
 * Given an Array of Replies and an Active Round determine if any of the replies
 * contain the words from the round. If so, a winner was found. The round is marked
 * as inactive in the database. Otherwise its ignored.
 * 
 * @param replies - An array of Threads replies
 * @param activeRound - The active round db object
 * @param config - Configuration object including the Threads access token
 * @returns string - The status of the active rounds
 * @throws FirebaseError if there's an issue writing to the database
 */
export const processActiveRounds = async (config: Config): Promise<string> => {
  try {

    // Ping the db, get the active rounds
    const activeRounds = await getActiveRounds(config.roundCollection, config.db);

    // If we have active rounds, process them
    if (activeRounds.length > 0) {
      for (const activeRound of activeRounds) {
        // Get all the replies from every active round
        const replies = await getThreadReplies(activeRound.threadsApiResponseId, config);

        // Determind the winner
        const winner = [];
        // Iterate over the replies, and check if any of them contain the round words
        if(replies.length > 0) {
          for (const reply of replies) {
            if (
              reply.text.toLowerCase().includes(activeRound.round.word1.toLowerCase()) &&
              reply.text.toLowerCase().includes(activeRound.round.word2.toLowerCase())
            ) {
              winner.push(reply);
            }
          }
          if (winner.length > 0) {
            await cancelRound(activeRound.threadsApiResponseId, config);
  
            const winnerByTimestamp = winner.sort((a, b) => {
              const dateA = new Date(a.time);
              const dateB = new Date(b.time);
              return dateA.getTime() - dateB.getTime(); 
            })[0];
        
            const replyResult = await replyToWinner(winnerByTimestamp, config);
            return replyResult;
          } else {
            return "No Winner Found"
          }
        } else {
          return "No Replies Found"
        }

      }
    } else {
      // TODO trigger a new round
      return "No Active Rounds Found"
    }

  } catch (error) {
    const errorMessage = `Error processing round: ${error}`
    throw new Error(errorMessage)
  }
};

