// __tests__/round/writeRound.test.ts

import { writeRound } from '../../src/services/round/writeRound';
import { FirebaseError } from '../../src/utils/errors';
import { Config } from '../../src/interfaces/config';
import { Round } from '../../src/interfaces/round';
import { DbObject } from '../../src/interfaces/dbObject';

jest.mock('../../src/services/threads/postThreadsCont');
jest.mock('../../src/services/threads/postThread');
import { postThreadsCont } from '../../src/services/threads/postThreadsCont';
import { postThread } from '../../src/services/threads/postThread';
const mockedPostThreadsCont = postThreadsCont as jest.MockedFunction<typeof postThreadsCont>;
const mockedPostThread = postThread as jest.MockedFunction<typeof postThread>;


describe('writeRound', () => {
    let mockConfig: Config; 
    let mockRound: Round;
    let mockDbObject: DbObject;
    let collectionMock: jest.Mock;
    let addMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockedPostThreadsCont.mockResolvedValueOnce('mockThreadsContainerResponse');
        mockedPostThread.mockResolvedValueOnce('mockThreadsPostResponseId');

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
            "threadsApiResponseId": "mockThreadsPostResponseId"
            }
    });

    it('should successfully write a round to the database and return a DocumentReferenceId', async () => {
        const mockDocRef = { id: 'mockThreadsPostResponseId'};
        addMock.mockResolvedValueOnce(mockDocRef);

        const result = await writeRound(mockRound, mockConfig);

        expect(collectionMock).toHaveBeenCalledWith(mockConfig.roundCollection);
        expect(addMock).toHaveBeenCalledWith(mockDbObject);
        expect(result).toBe(mockDocRef.id);
        expect(mockedPostThreadsCont).toHaveBeenCalledWith(mockRound, mockConfig);
        expect(mockedPostThread).toHaveBeenCalledWith('mockThreadsContainerResponse', mockConfig);
    });

    it('should throw a FirebaseError if there is an error writing to the database', async () => {
        const errorMessage = 'Simulated Firestore error';
        addMock.mockRejectedValueOnce(new Error(errorMessage));
    
        await expect(writeRound(mockRound, mockConfig)).rejects.toThrow(new FirebaseError(`Error adding document: Error: ${errorMessage}`));
    });
});