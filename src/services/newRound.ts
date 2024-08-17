// src/services/newRound.ts
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Round } from '../interfaces/round';
import { Config } from '../interfaces/config'
import { ApiRequestError } from '../utils/errors';

dotenv.config();

export const generateNewRound = async (config: Config): Promise<Round> => {
  try {
    const apiUrl = config.apiUrl;
    const workstationJwt = config.workstationJwt;

    if (!apiUrl) {
      throw new Error('API_SERVICE environment variable not set');
    }

    const response = await axios.get(apiUrl + 'api/generate', {
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': workstationJwt
      },
      withCredentials: true,
    });

    // Error handling
    if (response.data.error) {
      throw new ApiRequestError(`API returned an error: ${response.data.error}`);
    }

    const round: Round = {
      word1: response.data.text.word1,
      word2: response.data.text.word2,
      clue1: response.data.text.clue1,
      clue2: response.data.text.clue2,
    };

    return round; 

  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiRequestError(`Error fetching data from API: ${error.message}`);
    } else {
      throw error;
    }
  }
};