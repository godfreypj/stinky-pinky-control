// __tests__/threads/postThreads.test.ts

import axios from 'axios';
import { postThreadsCont } from '../../src/services/threads/postThreadsCont';
import { Config } from '../../src/interfaces/config';
import { Round } from '../../src/interfaces/round';
import { InvalidApiResponseError } from '../../src/utils/errors';
import { Firestore } from 'firebase-admin/firestore';

jest.mock('axios');

describe('postThreadsCont', () => {
  const mockConfig: Config = {
      threadsApi: 'https://example.com/threads/container?',
      threadsToken: 'mock_token',
      apiUrl: '',
      workstationJwt: '',
      projectEnv: '',
      roundCollection: '',
      db: new Firestore
  };
  const mockRound: Round = {
      clue1: 'A fruit that is red',
      clue2: 'A fruit that is yellow',
      word1: '',
      word2: ''
  };

  it('should successfully create a Threads container', async () => {
    const mockResponse = {
      data: { id: 'mock_container_id' },
    };
    (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await postThreadsCont(mockRound, mockConfig);

    const expectedFormattedMessage = `
      New Round!
      Clue: ${mockRound.clue1}
      Clue: ${mockRound.clue2}
    `;

    expect(axios.post).toHaveBeenCalledWith(
      `${mockConfig.threadsApi}me/threads?text=${encodeURIComponent(expectedFormattedMessage)}&media_type=text`,
      null,
      {
        headers: {
          Authorization: `Bearer ${mockConfig.threadsToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    expect(result).toBe('mock_container_id');
  });

  it('should throw InvalidApiResponseError on axios error', async () => {
    const mockError = {
      response: {
        data: {
          error: {
            message: 'Mock Threads error message',
          },
        },
      },
    };
    (axios.post as jest.Mock).mockRejectedValue(mockError);

    await expect(postThreadsCont(mockRound, mockConfig)).rejects.toThrow(InvalidApiResponseError);
    await expect(postThreadsCont(mockRound, mockConfig)).rejects.toThrow('Error creating container: Mock Threads error message');
  });

  it('should throw InvalidApiResponseError on generic error', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Generic error'));

    await expect(postThreadsCont(mockRound, mockConfig)).rejects.toThrow(InvalidApiResponseError);
    await expect(postThreadsCont(mockRound, mockConfig)).rejects.toThrow('Error creating container: Generic error');
  });
});