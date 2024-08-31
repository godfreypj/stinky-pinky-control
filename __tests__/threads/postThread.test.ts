// __tests__/threads/postThreads.test.ts

import axios from 'axios';
import { postThread } from '../../src/services/threads/postThread';
import { InvalidApiResponseError } from '../../src/utils/errors';
import { Config } from '../../src/interfaces/config';
import { Firestore } from 'firebase-admin/firestore';

jest.mock('axios'); // Mock axios for controlled API responses

describe('postThread', () => {
  const mockConfig: Config = {
      threadsApi: 'https://example.com/threads/post?',
      threadsToken: 'mock_token',
      apiUrl: '',
      workstationJwt: '',
      projectEnv: '',
      roundCollection: '',
      db: new Firestore
  };
  const mockId = 'mock_container_id';

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should successfully post a thread after 30 seconds', async () => {
    const mockResponse = {
      data: { id: 'mock_thread_id' },
    };
    (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const resultPromise = postThread(mockId, mockConfig);
    jest.advanceTimersByTime(30000);

    const result = await resultPromise;

    expect(axios.post).toHaveBeenCalledWith(
      `${mockConfig.threadsApi}creation_id=${encodeURIComponent(mockId)}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${mockConfig.threadsToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    expect(result).toBe('mock_thread_id');
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
    (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

    const resultPromise = postThread(mockId, mockConfig);
    jest.advanceTimersByTime(30000);

    await expect(resultPromise).rejects.toThrow(InvalidApiResponseError);
    await expect(resultPromise).rejects.toThrow('Error posting to Threads: Mock Threads error message');
  });

  it('should throw InvalidApiResponseError on generic error', async () => {
    (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Generic error'));

    const resultPromise = postThread(mockId, mockConfig);
    jest.advanceTimersByTime(30000);

    await expect(resultPromise).rejects.toThrow(InvalidApiResponseError);
    await expect(resultPromise).rejects.toThrow('Error posting to Threads: Generic error');
  });
});