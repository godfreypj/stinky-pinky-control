// src/services/getThreadReplies.ts

import axios from 'axios';
import { InvalidApiResponseError } from '../../utils/errors';
import { Config } from '../../interfaces/config';
import { Reply } from '../../interfaces/reply';

/**
 * Given a thread post ID, get the list of replies.
 * 
 * @param threadPostId - The ID of the thread post
 * @param config - Configuration object including the Threads access token
 * @returns An array of reply texts
 * @throws InvalidApiResponseError if there's an issue getting replies from Threads
 */
export const getThreadReplies = async (threadPostId: string, config: Config): Promise<Reply[]> => {
  try {
    const threadsApiResponse = await axios.get(
      `${config.threadsApi}${encodeURIComponent(threadPostId)}/replies?fields=text,timestamp`,
      {
        headers: {
          'Authorization': `Bearer ${config.threadsToken}`, 
        }
      }
    );
    const replies = threadsApiResponse.data.data.map((reply: { text: string; id: string; time: string; }) => ({
      text: reply.text,
      id: reply.id,
      time: reply.time
    }));
    return replies;

  } catch (error) {
    const errorMessage = `Error getting replies from Threads: ${error?.response?.data?.error?.message || error.message}`;
    throw new InvalidApiResponseError(errorMessage);
  }
};