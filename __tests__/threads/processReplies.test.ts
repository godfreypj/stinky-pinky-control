// __tests__/threads/processReplies.test.ts

import { processReplies } from '../../src/services/threads/processReplies';
import { Config } from '../../src/interfaces/config';
import { DbObject } from '../../src/interfaces/dbObject';
import { Reply } from '../../src/interfaces/reply';
import { cancelRound } from '../../src/services/round/cancelRound';
import { replyToWinner } from '../../src/services/threads/replyToWinner';

jest.mock('../../src/services/round/cancelRound');
jest.mock('../../src/services/threads/replyToWinner');

describe('processReplies', () => {
    let mockConfig: Config;
    let mockActiveRound: DbObject;
    let mockCancelRound: jest.Mock;
    let mockReplyToWinner: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCancelRound = cancelRound as jest.Mock;
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

        mockActiveRound = {
            round: {
                word1: 'apple',
                clue1: 'red fruit',
                word2: 'banana',
                clue2: 'yellow fruit'
            },
            active: true,
            threadsApiResponseId: 'mockId'
        };
    });

    it('should cancel the round if a winning reply is found', async () => {
        const mockReplies: Reply[] = [
            { text: 'apple and banana', id: '1', time: '2024-09-02T07:28:53+0000' },
            { text: 'apple and banana', id: '3', time: '2024-09-03T07:28:53+0000' },
            { text: 'Reply 2', id: '4', time: '2024-09-01T07:28:53+0000' },
        ];
        const mockCancelRoundId = 'cancelledRoundId';
        mockCancelRound.mockResolvedValueOnce(mockCancelRoundId);

        await processReplies(mockReplies, mockActiveRound, mockConfig);

        expect(mockCancelRound).toHaveBeenCalledWith(mockActiveRound.threadsApiResponseId, mockConfig);
    });

    it('should pick the winner by earliest time, regardless of case', async () => {
        const mockReplies: Reply[] = [
            { text: 'apPle and banana', id: '1', time: '2024-09-02T07:28:53+0000' },
            { text: 'aPple and baNana', id: '3', time: '2024-09-03T07:28:53+0000' },
            { text: 'Reply 2', id: '4', time: '2024-09-01T07:28:53+0000' },
        ];
        const mockCancelRoundId = 'cancelledRoundId';
        mockCancelRound.mockResolvedValueOnce(mockCancelRoundId);
    
        const expectedWinner = mockReplies[0];
        mockReplyToWinner.mockResolvedValueOnce('test'); 
    
        await processReplies(mockReplies, mockActiveRound, mockConfig);
    
        expect(mockCancelRound).toHaveBeenCalledWith(mockActiveRound.threadsApiResponseId, mockConfig);
        expect(mockReplyToWinner).toHaveBeenCalledWith(expectedWinner, mockConfig);
    });

    it('should not cancel the round if no winning reply is found', async () => {
        const mockReplies: Reply[] = [
            { text: 'wrong answers', id: '1', time: '2024-09-02T07:28:53+0000' },
            { text: 'only', id: '3', time: '2024-09-03T07:28:53+0000' },
            { text: 'Reply 2', id: '4', time: '2024-09-01T07:28:53+0000' },
        ];

        await processReplies(mockReplies, mockActiveRound, mockConfig);

        expect(mockCancelRound).not.toHaveBeenCalled();
    });

    it('should throw an error if cancelRound throws an error', async () => {
        const mockReplies: Reply[] = [
            { text: 'apple and banana', id: '1', time: '2024-09-02T07:28:53+0000' },
            { text: 'apple and banana', id: '3', time: '2024-09-03T07:28:53+0000' },
            { text: 'Reply 2', id: '4', time: '2024-09-01T07:28:53+0000' },
        ];
        const errorMessage = 'Simulated cancelRound error';
        mockCancelRound.mockRejectedValueOnce(new Error(errorMessage));

        await expect(processReplies(mockReplies, mockActiveRound, mockConfig)).rejects.toThrow(
            new Error(`Error processing round: Error: ${errorMessage}`)
        );
    });

    it('should throw an error if replyToWinner throws an error', async () => {
        const mockReplies: Reply[] = [
            { text: 'apple and banana', id: '1', time: '2024-09-02T07:28:53+0000' },
            { text: 'apple and banana', id: '3', time: '2024-09-03T07:28:53+0000' },
            { text: 'Reply 2', id: '4', time: '2024-09-01T07:28:53+0000' },
        ];
        const errorMessage = 'Simulated cancelRound error';
        mockReplyToWinner.mockRejectedValueOnce(new Error(errorMessage));

        await expect(processReplies(mockReplies, mockActiveRound, mockConfig)).rejects.toThrow(
            new Error(`Error processing round: Error: ${errorMessage}`)
        );
    });

});