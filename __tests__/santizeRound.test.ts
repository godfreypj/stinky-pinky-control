import { isRoundUnique } from '../src/services/round/sanitizeRound';
import { FirebaseError } from '../src/utils/errors';
import { db } from '../firebase';

// Mock the Firestore collection and query methods
jest.mock('../firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      get: jest.fn()
    }))
  }
}));

describe('isRoundUnique', () => {

    it('should return false if the round words match existing data (round is not unique)', async () => {
        // Mock the first query to return a non-empty querySnapshot (matching words)
        (db.collection as jest.Mock).mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValueOnce({ empty: false })
        });

        const round = { word1: 'apple', clue1: 'toast', word2: 'banana', clue2: 'yellow' };
        const result = await isRoundUnique(round, 'testCollection');
        expect(result).toBe(false);
    });

    it('should return true if no matching rounds are found (round is unique)', async () => {
        (db.collection as jest.Mock)
        .mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValueOnce({ empty: true })
        })
        .mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValueOnce({ empty: true })
        });

        const round = { word1: 'grape', clue1: 'purple', word2: 'orange', clue2: 'citrus' };
        const result = await isRoundUnique(round, 'testCollection');
        expect(result).toBe(true);
    });

    it('should throw FirebaseError on Firestore query error', async () => {
        // Mock the get function to throw an error
        (db.collection as jest.Mock).mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockRejectedValueOnce(new Error('Firestore error'))
        });

        const round = { word1: 'lemon', clue1: 'sour', word2: 'lime', clue2: 'green' };
        await expect(isRoundUnique(round, 'testCollection')).rejects.toThrow(FirebaseError);
    });
});