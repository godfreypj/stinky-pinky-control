// src/services/newRound.ts

import axios from 'axios';
import { Round } from '../interfaces/round';
import { Config } from '../interfaces/config'
import { ApiRequestError } from '../utils/errors';
import { GoogleAuth } from 'google-auth-library';

async function generateIdToken(config: Config) {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'] 
    });

    const client = await auth.getClient();

    // Directly request an ID token with the target audience
    const idToken = await client.request({
      url: 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=' + config.apiUrl,
      headers: { 
        'Metadata-Flavor': 'Google' 
      }
    });

    if (!idToken || !idToken.data) {
      throw new Error('Failed to generate ID token. No token returned.');
    }

    // Convert the Buffer to a string
    const tokenString = idToken.data.toString(); 

    return tokenString; 

  } catch (error) {
    console.error('Error generating ID token:', error);
    throw new Error('Failed to generate ID token.'); 
  }
}

export const generateNewRound = async (config: Config, req: any): Promise<Round> => {
  try {
    const apiUrl = config.apiUrl;
    const projectEnv = config.projectEnv;

    if (!apiUrl) {
      throw new Error('API_SERVICE environment variable not set');
    }

    let headers = {}
    // Set this up a little differently for local running
    if(projectEnv === 'local') {
      if (!config.workstationJwt) {
        throw new Error('WORKSTATION_JWT environment variable not set in local environment');
      }
      headers = {
        'Content-Type': 'application/json',
        'Cookie': config.workstationJwt
      }
    } else {
      const token = await generateIdToken(config)
      console.log(token)
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    }

    const response = await axios.get(apiUrl + 'api/generate', {
      baseURL: apiUrl,
      headers: headers,
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