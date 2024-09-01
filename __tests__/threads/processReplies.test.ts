// __tests__/threads/processReplies.test.ts

import { processReplies } from '../../src/services/threads/processReplies';
import { Config } from '../../src/interfaces/config';
import { DbObject } from '../../src/interfaces/dbObject';
import { Reply } from '../../src/interfaces/reply';
import { cancelRound } from '../../src/services/round/cancelRound';

jest.mock('../../src/services/round/cancelRound');

describe('processReplies', () => {
    let mockConfig: Config;
    let mockActiveRound: DbObject;
    let mockCancelRound: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCancelRound = cancelRound as jest.Mock;

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
            { text: 'I love apples and bananas!', id: '1' },
            { text: 'Reply 2', id: '2' },
        ];
        const mockCancelRoundId = 'cancelledRoundId';
        mockCancelRound.mockResolvedValueOnce(mockCancelRoundId);

        await processReplies(mockReplies, mockActiveRound, mockConfig);

        expect(mockCancelRound).toHaveBeenCalledWith(mockActiveRound.threadsApiResponseId, mockConfig);
        expect(mockActiveRound.active).toBe(false);
    });

    it('should not cancel the round if no winning reply is found', async () => {
        const mockReplies: Reply[] = [
            { text: 'I only like oranges.', id: '1' },
            { text: 'Reply 2', id: '2' },
        ];

        await processReplies(mockReplies, mockActiveRound, mockConfig);

        expect(mockCancelRound).not.toHaveBeenCalled();
        expect(mockActiveRound.active).toBe(true);
    });

    it('should handle case sensitivity in replies and round words', async () => {
        const mockReplies: Reply[] = [
            { text: 'I love Apples and BANANAS!', id: '1' },
            { text: 'Reply 2', id: '2' },
        ];
        const mockCancelRoundId = 'cancelledRoundId';
        mockCancelRound.mockResolvedValueOnce(mockCancelRoundId);

        await processReplies(mockReplies, mockActiveRound, mockConfig);

        expect(mockCancelRound).toHaveBeenCalledWith(mockActiveRound.threadsApiResponseId, mockConfig);
        expect(mockActiveRound.active).toBe(false);
    });

    it('should throw an error if cancelRound throws an error', async () => {
        const mockReplies: Reply[] = [
            { text: 'I love apples and bananas!', id: '1' },
            { text: 'Reply 2', id: '2' },
        ];
        const errorMessage = 'Simulated cancelRound error';
        mockCancelRound.mockRejectedValueOnce(new Error(errorMessage));

        await expect(processReplies(mockReplies, mockActiveRound, mockConfig)).rejects.toThrow(
            new Error(`Error processing round: Error: ${errorMessage}`)
        );
        expect(mockActiveRound.active).toBe(true);
    });
});