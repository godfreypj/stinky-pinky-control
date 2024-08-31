// __tests__/round/writeRound.test.ts

import { writeRound } from '../../src/services/round/writeRound';
import { FirebaseError } from '../../src/utils/errors';
import { Config } from '../../src/interfaces/config';
import { Round } from '../../src/interfaces/round';
import { DbObject } from '../../src/interfaces/dbObject';

describe('writeRound', () => {
    let mockConfig: Config;
    let mockRound: Round;
    let mockDbObject: DbObject;
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
            } as unknown as FirebaseFirestore.Firestore,
            apiUrl: '',
            workstationJwt: '',
            projectEnv: '',
            threadsToken: '',
            threadsApi: '',
        };

        mockRound = {
            word1: 'apple',
            clue1: 'red fruit',
            word2: 'banana',
            clue2: 'yellow fruit'
        };

        mockDbObject = {
            "round": {
                "clue1": "red fruit", "clue2": "yellow fruit", "word1": "apple", "word2": "banana"
            },
            "active": true,
            "threadsApiResponseId": "mock"
            }
    });

    it('should successfully write a round to the database and return a DocumentReferenceId', async () => {
        const mockDocRef = { id: 'mockId'}; 
        const mockThreadsApiResponse = "mock";
        addMock.mockResolvedValueOnce(mockDocRef);

        const result = await writeRound(mockRound, mockThreadsApiResponse, mockConfig);

        expect(collectionMock).toHaveBeenCalledWith(mockConfig.roundCollection);
        expect(addMock).toHaveBeenCalledWith(mockDbObject);
        expect(result).toBe(mockDocRef.id);
    });

    it('should throw a FirebaseError if there is an error writing to the database', async () => {
        const errorMessage = 'Simulated Firestore error';
        const mockThreadsApiResponse = "mock";
        addMock.mockRejectedValueOnce(new Error(errorMessage));
    
        await expect(writeRound(mockRound, mockThreadsApiResponse, mockConfig)).rejects.toThrow(new FirebaseError(`Error adding document: Error: ${errorMessage}`));
    });
});