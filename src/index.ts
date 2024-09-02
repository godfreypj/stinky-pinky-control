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
import { getActiveRounds } from './services/round/getActiveRounds';
import { getThreadReplies } from './services/threads/getThreadReplies';
import { processReplies } from './services/threads/processReplies';

const app = express();
app.use(cors());

async function startServer() { 
  try {
    const config = await loadAndInitializeConfig();
    console.log('*******\nBeep Boop. Welcome to Stinky Pinky Control.\n')
    console.log('Running in env: ', config.projectEnv)
    console.log('Writing to: ', config.roundCollection)

    const port = parseInt(process.env.PORT || '3000');
    app.listen(port, () => {
      console.log(`Listening on port: ${port}`);
    });

    app.get('/post_new_round', async (req, res) => {
      try {
        let round: Round | null = null;
        let isUnique = false;
    
        while (!isUnique) {
          // TODO encapuslate all of this inside generateNewRound
          round = await generateNewRound(config);
          isUnique = await isRoundUnique(round, config.roundCollection);
        }
    
        if (round) {
          try {
            // Create a threads container
            const threadsContainerResponse = await postThreadsCont(round, config)
            // Post the thread
            const threadsPostResponseId = await postThread(threadsContainerResponse, config)
            // TODO encapuslate all of this inside writeRound
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

    app.get('/process_active_rounds', async (req, res) => {
      try {
        // Get all the active rounds out right now
        const activeRounds = await getActiveRounds(config.roundCollection, config.db);
        if (activeRounds.length > 0) {
          for (const activeRound of activeRounds) {
            const replies = await getThreadReplies(activeRound.threadsApiResponseId, config);
            // TODO encapuslate all of this inside processReplies and change it to processActiveRounds
            processReplies(replies, activeRound, config);
          }
          res.json(activeRounds);
        } else {
          res.status(404).send('No active rounds found.');
        }
      } catch (error) {
        res.status(500).send('Error fetching active rounds: ' + error); 
      }
    });

  } catch (error) {
    console.error('Critical error during startup: ', error);
    process.exit(1);
  }
}

// Start the server
startServer();
