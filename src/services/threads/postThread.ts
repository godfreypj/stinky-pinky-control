// src/services/postThreads.ts

import axios from 'axios';
import { Round } from '../../interfaces/round';
import { InvalidApiResponseError } from '../../utils/errors';
import { Config } from '../../interfaces/config';

/**
 * Given a Round object, post a formatted message to Threads.
 * 
 * @param round - The Round object containing data to be included in the post
 * @param config - Configuration object including the Threads access token
 * @returns The response data from the Threads API
 * @throws InvalidApiResponseError if there's an issue posting to Threads
 */
export const postThreads = async (round: Round, config: Config): Promise<any> => {
  try {
    // Extract and format the message from the round object
    const formattedMessage = `
      New Round!
      ${round}
    `;

    const threadsApiResponse = await axios.post(
      `${config.threadsApi}text=${encodeURIComponent(formattedMessage)}&media_type=text`, // Include text and media_type in query string
      null, // No request body needed for text-only posts
      {
        headers: {
          'Authorization': `Bearer ${config.threadsToken}`, 
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Threads API Response:', threadsApiResponse.data);
    return threadsApiResponse.data;

  } catch (error) {
    // Provide more context in the error message
    const errorMessage = `Error posting to Threads: ${error?.response?.data?.error?.message || error.message}`;
    throw new InvalidApiResponseError(errorMessage);
  }
};