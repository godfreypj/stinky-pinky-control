// __tests__/round/getActiveRounds.test.ts

import { getActiveRounds } from '../../src/services/round/getActiveRounds';
import { FirebaseError } from '../../src/utils/errors';

describe('getActiveRounds', () => {
    let collectionMock: jest.Mock;
    let whereMock: jest.Mock;
    let getMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        getMock = jest.fn();
        whereMock = jest.fn(() => ({ get: getMock }));
        collectionMock = jest.fn(() => ({ where: whereMock }));
    });

    it('should successfully fetch active rounds and return an array of DbObjects', async () => {
        const mockRoundCollection = 'testRounds';
        const mockDb = { collection: collectionMock } as unknown as FirebaseFirestore.Firestore;
        const mockSnapshot = {
            forEach: jest.fn((callback) => {
                callback({ data: () => ({ active: true, someData: 'testData' }) });
                callback({ data: () => ({ active: true, otherData: 'moreTestData' }) });
            })
        };
        getMock.mockResolvedValueOnce(mockSnapshot);

        const result = await getActiveRounds(mockRoundCollection, mockDb);

        expect(collectionMock).toHaveBeenCalledWith(mockRoundCollection);
        expect(whereMock).toHaveBeenCalledWith('active', '==', true);
        expect(getMock).toHaveBeenCalled();
        expect(result).toEqual([
            { active: true, someData: 'testData' },
            { active: true, otherData: 'moreTestData' }
        ]);
    });

    it('should return an empty array if no active rounds are found', async () => {
        const mockRoundCollection = 'testRounds';
        const mockDb = { collection: collectionMock } as unknown as FirebaseFirestore.Firestore;
        const mockSnapshot = {
            forEach: jest.fn() 
        };
        getMock.mockResolvedValueOnce(mockSnapshot);

        const result = await getActiveRounds(mockRoundCollection, mockDb);

        expect(collectionMock).toHaveBeenCalledWith(mockRoundCollection);
        expect(whereMock).toHaveBeenCalledWith('active', '==', true);
        expect(getMock).toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('should throw a FirebaseError if there is an error fetching from the database', async () => {
        const mockRoundCollection = 'testRounds';
        const mockDb = { collection: collectionMock } as unknown as FirebaseFirestore.Firestore;
        const errorMessage = 'Simulated Firestore error';
        getMock.mockRejectedValueOnce(new Error(errorMessage));

        await expect(getActiveRounds(mockRoundCollection, mockDb)).rejects.toThrow(
            new FirebaseError('Error fetching active rounds: Error: ' + errorMessage)
        );
    });
});