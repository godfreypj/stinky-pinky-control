import express from 'express';
import cors from "cors";
import { generateNewRound } from './services/round/newRound';
import { ApiRequestError, InvalidApiResponseError } from './utils/errors';
import { loadAndInitializeConfig } from './utils/loadConfig';
import { writeRound } from './services/round/writeRound';
import { processActiveRounds } from './services/threads/processActiveRounds';

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
        const round = await generateNewRound(config);
        try {
          const docRefId = await writeRound(round, config)
          res.send("Successful Round Created, Posted & Saved: " + docRefId);
        } catch (error) {
          res.send("Error posting new round: " + error);
        }
      } catch (error) {
        if (error instanceof ApiRequestError || error instanceof InvalidApiResponseError) {
          res.status(500).send(error.message);
        } else {
          res.status(500).send('Error posting new round' + error);
        }
      }
    });

    app.get('/process_active_rounds', async (req, res) => {
      try {
        processActiveRounds(config);
      } catch (error) {
        if (error instanceof ApiRequestError || error instanceof InvalidApiResponseError) {
          res.status(500).send(error.message);
        } else {
          res.status(500).send('Error processing active rounds: ' + error);
        }
      }
    });

  } catch (error) {
    console.error('Critical error during startup: ', error);
    process.exit(1);
  }
}

// Start the server
startServer();
