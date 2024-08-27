// src/services/postThreads.ts

import axios from 'axios';
import { InvalidApiResponseError } from '../../utils/errors';
import { Config } from '../../interfaces/config';

/**
 * Given a container ID wait 30 seconds, then post the thread.
 * 
 * @param id - The container ID
 * @param config - Configuration object including the Threads access token
 * @returns The response data from the Threads API
 * @throws InvalidApiResponseError if there's an issue posting to Threads
 */
export const postThread = async (id: string, config: Config): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 30000));

  try {
    const threadsApiResponse = await axios.post(
      `${config.threadsPostApi}creation_id=${encodeURIComponent(id)}`,
      null,
      {
        headers: {
          'Authorization': `Bearer ${config.threadsToken}`, 
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Successful Threads POST:', threadsApiResponse.data.id);
    return threadsApiResponse.data.id;

  } catch (error) {
    const errorMessage = `Error posting to Threads: ${error?.response?.data?.error?.message || error.message}`;
    throw new InvalidApiResponseError(errorMessage);
  }
};