// __tests__/threads/getThreadReplies.test.ts

import axios from 'axios';
import { getThreadReplies } from '../../src/services/threads/getThreadReplies';
import { InvalidApiResponseError } from '../../src/utils/errors';
import { Config } from '../../src/interfaces/config';
import { Firestore } from 'firebase-admin/firestore';

jest.mock('axios');

describe('getThreadReplies', () => {
  const mockConfig: Config = {
    threadsApi: 'https://example.com/threads/', // Note the trailing slash here
    threadsToken: 'mock_token',
    apiUrl: '',
    workstationJwt: '',
    projectEnv: '',
    roundCollection: '',
    db: new Firestore
  };
  const mockThreadPostId = 'mock_thread_post_id';

  it('should successfully get thread replies', async () => {
    const mockResponse = {
      data: {
        data: [
          { text: 'Reply 1', id: '1' },
          { text: 'Reply 2', id: '2' },
        ],
      }
    };
    (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await getThreadReplies(mockThreadPostId, mockConfig);

    expect(axios.get).toHaveBeenCalledWith(
      `${mockConfig.threadsApi}${mockThreadPostId}/replies?fields=text`,
      {
        headers: {
          Authorization: `Bearer ${mockConfig.threadsToken}`,
        },
      }
    );
    expect(result).toEqual([
      {
        'text': 'Reply 1', 
        'id': '1'
      },
      {
        'text': 'Reply 2',
        'id': '2'
      }
    ]);
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
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(getThreadReplies(mockThreadPostId, mockConfig)).rejects.toThrow(
      InvalidApiResponseError
    );
    await expect(getThreadReplies(mockThreadPostId, mockConfig)).rejects.toThrow(
      'Error getting replies from Threads: Mock Threads error message'
    );
  });

  it('should throw InvalidApiResponseError on generic error', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Generic error'));

    await expect(getThreadReplies(mockThreadPostId, mockConfig)).rejects.toThrow(
      InvalidApiResponseError
    );
    await expect(getThreadReplies(mockThreadPostId, mockConfig)).rejects.toThrow(
      'Error getting replies from Threads: Generic error'
    );
  });
});