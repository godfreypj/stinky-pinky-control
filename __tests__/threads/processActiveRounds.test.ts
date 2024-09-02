// __tests__/threads/processReplies.test.ts

import { processActiveRounds } from '../../src/services/threads/processActiveRounds';
import { Config } from '../../src/interfaces/config';
import { DbObject } from '../../src/interfaces/dbObject';
import { Reply } from '../../src/interfaces/reply';
import { cancelRound } from '../../src/services/round/cancelRound';
import { getActiveRounds } from '../../src/services/round/getActiveRounds';
import { getThreadReplies } from '../../src/services/threads/getThreadReplies';
import { replyToWinner } from '../../src/services/threads/replyToWinner';

jest.mock('../../src/services/round/cancelRound');
jest.mock('../../src/services/round/getActiveRounds');
jest.mock('../../src/services/threads/getThreadReplies');
jest.mock('../../src/services/threads/replyToWinner');

describe('processActiveRounds', () => {
    let mockConfig: Config;
    let mockCancelRound: jest.Mock;
    let mockGetActiveRounds: jest.Mock;
    let mockGetThreadReplies: jest.Mock;
    let mockReplyToWinner: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCancelRound = cancelRound as jest.Mock;
        mockGetActiveRounds = getActiveRounds as jest.Mock;
        mockGetThreadReplies = getThreadReplies as jest.Mock;
        mockReplyToWinner = replyToWinner as jest.Mock;

        mockConfig = {
            roundCollection: 'testRounds',
            db: {} as unknown as FirebaseFirestore.Firestore,
            apiUrl: '',
            workstationJwt: '',
            projectEnv: '',
            threadsToken: '',
            threadsApi: '',
        };
    });

    it('should cancel the round and reply to the winner if a winning reply is found', async () => {
        const mockActiveRounds: DbObject[] = [
            {
                round: {
                    word1: 'apple',
                    clue1: 'red fruit',
                    word2: 'banana',
                    clue2: 'yellow fruit'
                },
                active: true,
                threadsApiResponseId: 'mockId'
            }
        ];
        const mockReplies: Reply[] = [
            { text: 'apple and banana', id: '1', time: '2024-09-02T07:28:53+0000' },
            { text: 'apple and banana', id: '3', time: '2024-09-03T07:28:53+0000' },
            { text: 'Reply 2', id: '4', time: '2024-09-01T07:28:53+0000' },
        ];

        mockGetActiveRounds.mockResolvedValueOnce(mockActiveRounds);
        mockGetThreadReplies.mockResolvedValueOnce(mockReplies);
        mockCancelRound.mockResolvedValueOnce('cancelledRoundId');
        mockReplyToWinner.mockResolvedValueOnce('test');

        await processActiveRounds(mockConfig);

        expect(mockGetActiveRounds).toHaveBeenCalledWith(mockConfig.roundCollection, mockConfig.db);
        expect(mockGetThreadReplies).toHaveBeenCalledWith(mockActiveRounds[0].threadsApiResponseId, mockConfig);
        expect(mockCancelRound).toHaveBeenCalledWith(mockActiveRounds[0].threadsApiResponseId, mockConfig);
        expect(mockReplyToWinner).toHaveBeenCalledWith(mockReplies[0], mockConfig); // Earliest reply wins
    });

    it('should not cancel the round if no winning reply is found', async () => {
        const mockActiveRounds: DbObject[] = [
            {
                round: {
                    word1: 'apple',
                    clue1: 'red fruit',
                    word2: 'banana',
                    clue2: 'yellow fruit'
                },
                active: true,
                threadsApiResponseId: 'mockId'
            }
        ];
        const mockReplies: Reply[] = [
            { text: 'wrong answers', id: '1', time: '2024-09-02T07:28:53+0000' },
            { text: 'only', id: '3', time: '2024-09-03T07:28:53+0000' },
            { text: 'Reply 2', id: '4', time: '2024-09-01T07:28:53+0000' },
        ];

        mockGetActiveRounds.mockResolvedValueOnce(mockActiveRounds);
        mockGetThreadReplies.mockResolvedValueOnce(mockReplies);

        await processActiveRounds(mockConfig);

        expect(mockCancelRound).not.toHaveBeenCalled();
        expect(mockReplyToWinner).not.toHaveBeenCalled();
    });

    it('should do nothing if there are no active rounds', async () => {
        mockGetActiveRounds.mockResolvedValueOnce([]);

        await processActiveRounds(mockConfig);

        expect(mockGetThreadReplies).not.toHaveBeenCalled();
        expect(mockCancelRound).not.toHaveBeenCalled();
        expect(mockReplyToWinner).not.toHaveBeenCalled();
    });

    it('should throw an error if there is an issue processing the rounds', async () => {
        const mockActiveRounds: DbObject[] = [
            {
                round: {
                    word1: 'apple',
                    clue1: 'red fruit',
                    word2: 'banana',
                    clue2: 'yellow fruit'
                },
                active: true,
                threadsApiResponseId: 'mockId'
            }
        ];

        // Mock getActiveRounds to return the mock active rounds
        mockGetActiveRounds.mockResolvedValueOnce(mockActiveRounds);

        // Mock getThreadReplies to throw an error
        const errorMessage = 'Simulated error fetching replies';
        mockGetThreadReplies.mockRejectedValueOnce(new Error(errorMessage));

        // Expect processActiveRounds to throw an error
        await expect(processActiveRounds(mockConfig)).rejects.toThrow(`Error processing round: Error: ${errorMessage}`);

        // Assert that cancelRound and replyToWinner are not called
        expect(mockCancelRound).not.toHaveBeenCalled();
        expect(mockReplyToWinner).not.toHaveBeenCalled();
    });

});