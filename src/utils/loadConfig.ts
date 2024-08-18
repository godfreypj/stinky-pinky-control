// utils/loadConfig.js

import * as dotenv from 'dotenv';
import { ConfigLoadingError, FirebaseInitError } from './errors';
import { initializeFirebase, db } from '../../firebase';
import { Config } from '../interfaces/config';

export async function loadAndInitializeConfig() {
  try {
    dotenv.config();

    // Check for required environment variables
    const requiredEnvVars = ['SP_BRAIN', 'WORKSTATION_JWT', 'PROJECT_ENV'];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        throw new ConfigLoadingError(`Missing required environment variable: ${varName}`);
      }
    }

    // Initialize Firebase
    try {
      await initializeFirebase(); 
    } catch (error) {
      throw new FirebaseInitError(`Error initializing Firebase: ${error.message}`);
    }

    // Return the loaded configuration
    const appConfig: Config = {
      apiUrl: process.env.SP_BRAIN as string,
      workstationJwt: process.env.WORKSTATION_JWT as string,
      projectEnv: process.env.PROJECT_ENV as string,
      roundCollection: `stinky-pinky-rounds-${process.env.PROJECT_ENV}`,
      db: db
    };
    return appConfig;

  } catch (error) {
    console.error('Error during configuration loading:', error);
    process.exit(1);
  }
}