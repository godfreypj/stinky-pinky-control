import axios from 'axios';
import { generateNewRound } from '../src/services/newRound';
import { Config } from '../src/interfaces/config';
import { ApiRequestError } from '../src/utils/errors';
import { Firestore } from 'firebase-admin/firestore';
import { generateIdToken } from '../src/utils/token';

// Mocks
jest.mock('axios');
jest.mock('../src/utils/token');

describe('generateNewRound', () => {
    // Mock config object for tests
    const mockConfig: Config = {
        apiUrl: 'https://example.com/',
        projectEnv: 'local',
        workstationJwt: 'mock_jwt_token',
        roundCollection: '',
        db: new Firestore
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
  });