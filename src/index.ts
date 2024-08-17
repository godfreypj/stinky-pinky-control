import express from 'express';
import * as dotenv from 'dotenv';
import cors from "cors";
import { db } from '../firebase'
import { generateNewRound } from './services/newRound';
import { Round } from './interfaces/round';
import { roundExists } from './services/sanitizeRound';
import { ApiRequestError, InvalidApiResponseError } from './utils/errors';

const app = express();
app.use(cors());

dotenv.config();

app.get('/', async (req, res) => {
  try {
    let round: Round | null = null;
    let isUnique = false;

    const environment = process.env.PROJECT_ENV; 
    const collectionName = `stinky-pinky-rounds-${environment}`;

    // Keep generating new rounds until a unique one is found
    while (!isUnique) {
      round = await generateNewRound();
      isUnique = !(await roundExists(round, collectionName));
    }

    if (round) {
      try {
        const docRef = await db.collection(collectionName).add(round);
        res.send("Document written with ID: " + docRef.id);
      } catch (error) {
        res.send("Error adding document: " + error);
      }
    } else {
      res.status(500).send('Unable to generate a unique round.');
    }
  } catch (error) {
    if (error instanceof ApiRequestError || error instanceof InvalidApiResponseError) {
      res.status(500).send(error.message);
    } else {
    res.status(500).send('Error fetching data from API' + error);
    }
  }
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
