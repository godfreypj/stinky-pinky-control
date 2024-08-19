import { writeRound } from '../src/services/writeRound';
import { FirebaseError } from '../src/utils/errors';
import { Config } from '../src/interfaces/config';
import { Round } from '../src/interfaces/round';

describe('writeRound', () => {
    let mockConfig: Config;
    let mockRound: Round;
    let collectionMock: jest.Mock;
    let addMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        addMock = jest.fn();
        collectionMock = jest.fn(() => ({
            add: addMock
        }));

        mockConfig = {
            roundCollection: 'testRounds',
            db: {
                collection: collectionMock
            } as any,
            apiUrl: '',
            workstationJwt: '',
            projectEnv: ''
        };

        mockRound = {
            word1: 'apple',
            clue1: 'red fruit',
            word2: 'banana',
            clue2: 'yellow fruit'
        };
    });

    it('should successfully write a round to the database and return a DocumentReference', async () => {
        const mockDocRef = {} as any; 
        addMock.mockResolvedValueOnce(mockDocRef);

        const result = await writeRound(mockRound, mockConfig);

        expect(collectionMock).toHaveBeenCalledWith(mockConfig.roundCollection);
        expect(addMock).toHaveBeenCalledWith(mockRound);
        expect(result).toBe(mockDocRef);
    });

    it('should throw a FirebaseError if there is an error writing to the database', async () => {
        const errorMessage = 'Simulated Firestore error';
        addMock.mockRejectedValueOnce(new Error(errorMessage));
    
        await expect(writeRound(mockRound, mockConfig)).rejects.toThrow(new FirebaseError(`Error adding document: Error: ${errorMessage}`));
    });
});