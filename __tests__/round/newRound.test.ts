// __tests__/round/newRound.test.ts

import axios from 'axios';
import { generateNewRound } from '../../src/services/round/newRound';
import { Config } from '../../src/interfaces/config';
import { ApiRequestError } from '../../src/utils/errors';
import { Firestore } from 'firebase-admin/firestore';
import { generateIdToken } from '../../src/utils/token';

// Mocks
jest.mock('axios');
jest.mock('../../src/utils/token');

describe('generateNewRound', () => {
    // Mock config object for tests
    const mockConfig: Config = {
      apiUrl: 'https://example.com/',
      projectEnv: 'local',
      workstationJwt: 'mock_jwt_token',
      roundCollection: '',
      db: new Firestore,
      threadsToken: '',
      threadsContApi: '',
      threadsPostApi: ''
    };
  
    // Happy Path
    it('should fetch a new round successfully in local environment', async () => {
      // Mock successful API response
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce({
        data: {
          text: {
            word1: 'apple',
            word2: 'banana',
            clue1: 'fruit',
            clue2: 'yellow',
          },
        },
      });
  
      const round = await generateNewRound(mockConfig);
  
      expect(round).toEqual({
        word1: 'apple',
        word2: 'banana',
        clue1: 'fruit',
        clue2: 'yellow',
      });
    });

    it('should fetch a new round successfully in a production environment', async () => {
      // Mock config for production environment
      const mockConfigProd: Config = {
          ...mockConfig,
          projectEnv: 'production',
      };

      // Mock successful token generation
      const mockToken = 'mock_generated_token';
      (generateIdToken as jest.MockedFunction<typeof generateIdToken>).mockResolvedValueOnce(mockToken);

      // Mock successful API response
      const mockResponse = {
          data: {
              text: {
                  word1: 'grape',
                  word2: 'orange',
                  clue1: 'purple fruit',
                  clue2: 'citrus fruit',
              },
          },
      };
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(mockResponse);

      const round = await generateNewRound(mockConfigProd);

      // Assert that generateIdToken was called
      expect(generateIdToken).toHaveBeenCalledWith(mockConfigProd);

      // Assert the expected API call with Authorization header
      expect(axios.get).toHaveBeenCalledWith('https://example.com/api/generate', {
          baseURL: mockConfigProd.apiUrl,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mockToken}`,
          },
          withCredentials: true,
      });

      // Assert the returned round data
      expect(round).toEqual({
          word1: 'grape',
          word2: 'orange',
          clue1: 'purple fruit',
          clue2: 'citrus fruit',
      });
  });

    // Sad path, can't generate a token
    it('should throw an ApiRequestError if generateIdToken throws an error', async () => {
        // Mock config for non-local environment
        const mockConfigNonLocal: Config = {
          ...mockConfig,
          projectEnv: 'production',
        };
    
        // Mock generateIdToken to throw an ApiRequestError
        (generateIdToken as jest.MockedFunction<typeof generateIdToken>).mockRejectedValue(
          new ApiRequestError('Error generating token')
        );
    
        await expect(generateNewRound(mockConfigNonLocal)).rejects.toThrow(ApiRequestError);
        await expect(generateNewRound(mockConfigNonLocal)).rejects.toThrow('Error generating token');
      });

    // Sad path, bad API return
    it('should throw an ApiRequestError if the API returns an error', async () => {
        // Mock API response with an error
        (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({
          data: {
            error: 'Some error message from the API',
          },
        });
      
        await expect(generateNewRound(mockConfig)).rejects.toThrow(
          ApiRequestError
        );
        await expect(generateNewRound(mockConfig)).rejects.toThrow(
          'API returned an error: Some error message from the API'
        );
      });
      it('should throw error when projectEnv is "local" and no jwt present', async () => {
        const mockResponse = {
            data: {
                text: {
                    word1: 'apple',
                    word2: 'banana',
                    clue1: 'fruit',
                    clue2: 'yellow',
                },
            },
        };
        (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(mockResponse);

        mockConfig.workstationJwt = '';

        await expect(generateNewRound(mockConfig)).rejects.toThrow(
            'Unknown API error: Error: WORKSTATION_JWT environment variable not set in local environment'
        );
    });
  });