import express from 'express';
import cors from "cors";
import { generateNewRound } from './services/round/newRound';
import { Round } from './interfaces/round';
import { isRoundUnique } from './services/round/sanitizeRound';
import { ApiRequestError, InvalidApiResponseError } from './utils/errors';
import { loadAndInitializeConfig } from './utils/loadConfig';
import { writeRound } from './services/round/writeRound';
import { postThreadsCont } from './services/threads/postThreadsCont';
import { postThread } from './services/threads/postThread';

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
    
        while (!isUnique) {
          round = await generateNewRound(config);
          isUnique = await isRoundUnique(round, config.roundCollection);
        }
    
        if (round) {
          try {
            // Create a threads container
            const threadsContainerResponse = await postThreadsCont(round, config)
            // Post the thread
            const threadsPostResponseId = await postThread(threadsContainerResponse, config)
            // Write the info to the database
            const docRefId = await writeRound(round, threadsPostResponseId, config)
            res.send("Successful Round Created, Posted & Saved: " + docRefId);
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
