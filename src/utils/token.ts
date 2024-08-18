// src/utils/token.ts

import { GoogleAuth } from 'google-auth-library';
import { Config } from '../interfaces/config';
import { ApiRequestError } from './errors';

/**
 * Given the applications config, generate a new ID token.
 * Based on the SP_BRAIN url, to connect to the Brain application.
 * 
 * @param Config - The apps config object.
 * @returns idToken a unique jwt token
 * @throws ApiRequestError if there's an issue generating a token.
 */
async function generateIdToken(config: Config) {
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();

    const response = await client.request({
      url: 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=' + config.apiUrl,
      headers: {
        'Metadata-Flavor': 'Google'
      },
      responseType: 'text'
    });

    const idToken = response.data;

    if (!idToken) {
      throw new ApiRequestError('Failed to generate ID token. No token returned.');
    }

    return idToken;

  } catch (error) {
    console.error('Error generating ID token:', error);
    throw new ApiRequestError('Failed to generate ID token.');
  }
}

export { generateIdToken };