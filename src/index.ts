import express from 'express';
import cors from "cors";
import { generateNewRound } from './services/newRound';
import { Round } from './interfaces/round';
import { isRoundUnique } from './services/sanitizeRound';
import { ApiRequestError, InvalidApiResponseError } from './utils/errors';
import { loadAndInitializeConfig } from './utils/loadConfig';

const app = express();
app.use(cors());

async function startServer() { 
  try {
    const config = await loadAndInitializeConfig();
    console.log('*******\nBeep Boop. Welcome to Stinky Pinky Control.\n')
    console.log('Running in env: ', config.projectEnv)
    console.log('Writing to: ', config.roundCollection)

    app.get('/', async (req, res) => {
      try {
        let round: Round | null = null;
        let isUnique = false;
    
        const roundCollection = config.roundCollection;
        const database = config.db;
    
        while (!isUnique) {
          round = await generateNewRound(config);
          isUnique = !(await isRoundUnique(round, roundCollection));
        }
    
        if (round) {
          try {
            const docRef = await database.collection(roundCollection).add(round);
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
      console.log(`Listening on port: ${port}`);
    });
  } catch (error) {
    console.error('Critical error during startup: ', error);
    process.exit(1);
  }
}

// Start the server
startServer();


