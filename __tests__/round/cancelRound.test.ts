// __tests__/round/cancelRound.test.ts

import { cancelRound } from '../../src/services/round/cancelRound';
import { FirebaseError } from '../../src/utils/errors';
import { Config } from '../../src/interfaces/config';
import { WriteResult } from 'firebase-admin/firestore';

describe('cancelRound', () => {
    let mockConfig: Config;
    let collectionMock: jest.Mock;
    let whereMock: jest.Mock;
    let getMock: jest.Mock;
    let updateMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        updateMock = jest.fn();
        getMock = jest.fn();
        whereMock = jest.fn(() => ({ get: getMock }));
        collectionMock = jest.fn(() => ({ where: whereMock }));

        mockConfig = {
            roundCollection: 'testRounds',
            db: {
                collection: collectionMock
            } as unknown as FirebaseFirestore.Firestore,
            apiUrl: '',
            workstationJwt: '',
            projectEnv: '',
            threadsToken: '',
            threadsApi: '',
        };
    });

    it('should successfully cancel a round and return a WriteResult', async () => {
        const mockThreadsApiResponseId = "mockId";
        const mockSnapshot = { 
            empty: false, 
            docs: [{ ref: { update: updateMock } }] 
        };
        const mockWriteResult = {} as WriteResult; 
        getMock.mockResolvedValueOnce(mockSnapshot);
        updateMock.mockResolvedValueOnce(mockWriteResult);

        const result = await cancelRound(mockThreadsApiResponseId, mockConfig);

        expect(collectionMock).toHaveBeenCalledWith(mockConfig.roundCollection);
        expect(whereMock).toHaveBeenCalledWith('threadsApiResponseId', '==', mockThreadsApiResponseId);
        expect(getMock).toHaveBeenCalled();
        expect(updateMock).toHaveBeenCalledWith({ active: false });
        expect(result).toBe(mockWriteResult);
    });

    it('should throw a FirebaseError if no round is found', async () => {
        const mockThreadsApiResponseId = "nonExistentId";
        const mockSnapshot = { empty: true };
        getMock.mockResolvedValueOnce(mockSnapshot);

        await expect(cancelRound(mockThreadsApiResponseId, mockConfig)).rejects.toThrow(
            new FirebaseError(`Error cancelling round: FirebaseInitError: No round found with threadsApiResponseId: ${mockThreadsApiResponseId}`)
        );
    });

    it('should throw a FirebaseError if there is an error updating the database', async () => {
        const mockThreadsApiResponseId = "mockId";
        const mockSnapshot = { 
            empty: false, 
            docs: [{ ref: { update: updateMock } }] 
        };
        const errorMessage = 'Simulated Firestore error';
        getMock.mockResolvedValueOnce(mockSnapshot);
        updateMock.mockRejectedValueOnce(new Error(errorMessage));

        await expect(cancelRound(mockThreadsApiResponseId, mockConfig)).rejects.toThrow(
            new FirebaseError('Error cancelling round: Error: ' + errorMessage)
        );
    });
});