// src/services/newRound.ts

import axios from 'axios';
import { Round } from '../interfaces/round';
import { Config } from '../interfaces/config'
import { ApiRequestError } from '../utils/errors';
import { generateIdToken } from '../utils/token';

/**
 * Given the applications config, query the Brain application for a new round.
 * If the round is not unique (to the given environment), query until a unique round is found.
 * 
 * @param Config - The apps config object.
 * @returns Round A unique round.
 * @throws ApiRequestError if there's an issue finding a unique round.
 */
export const generateNewRound = async (config: Config): Promise<Round> => {
  try {
    const apiUrl = config.apiUrl;
    const projectEnv = config.projectEnv;

    let headers = {}

    // Local request, put the JWT into the Cookies
    if(projectEnv === 'local') {
      if (!config.workstationJwt) {
        throw new Error('WORKSTATION_JWT environment variable not set in local environment');
      }
      headers = {
        'Content-Type': 'application/json',
        'Cookie': config.workstationJwt
      }
    } else { // Deployed request, get a real token from the service
      const token = await generateIdToken(config)
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    }

    // Call the brain
    const response = await axios.get(apiUrl + 'api/generate', {
      baseURL: apiUrl,
      headers: headers,
      withCredentials: true,
    });

    // Make sure we return the error from the brain, if there was one
    if (response.data.error) {
      throw new ApiRequestError(`API returned an error: ${response.data.error}`);
    }

    // Build a new round object and return it
    const round: Round = {
      word1: response.data.text.word1,
      word2: response.data.text.word2,
      clue1: response.data.text.clue1,
      clue2: response.data.text.clue2,
    };

    return round; 

  } catch (error) {
    if(error instanceof ApiRequestError) {
      throw error
    } else {
      throw new Error("Unknown API error: " + error)
    }
  }
};