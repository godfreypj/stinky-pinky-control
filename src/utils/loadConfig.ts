// utils/loadConfig.js

import * as dotenv from 'dotenv';
import { ConfigLoadingError, FirebaseError } from './errors';
import { initializeFirebase, db } from '../../firebase';
import { Config } from '../interfaces/config';

/**
 * Attemps to create a configuration object.
 * The collection to be written is based on the current environment.
 * If a config cannot be create the application is not started.
 * 
 * @returns Config - A new configuration.
 * @throws FirebaseInitError 0r Exits the process if a configuration cannot be loaded.
 */
export async function loadAndInitializeConfig() {
  try {
    dotenv.config();

    // Check for required environment variables
    const requiredEnvVars = ['SP_BRAIN', 'WORKSTATION_JWT', 'PROJECT_ENV', 'THREADS_TOKEN'];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        throw new ConfigLoadingError(`Missing required environment variable: ${varName}`);
      }
    }

    // Initialize Firebase
    try {
      await initializeFirebase(); 
    } catch (error) {
      throw new FirebaseError(`Error initializing Firebase: ${error.message}`);
    }

    // Return the loaded configuration
    const appConfig: Config = {
      apiUrl: process.env.SP_BRAIN as string,
      workstationJwt: process.env.WORKSTATION_JWT as string,
      projectEnv: process.env.PROJECT_ENV as string,
      roundCollection: `stinky-pinky-rounds-${process.env.PROJECT_ENV}`,
      db: db,
      threadsToken: process.env.THREADS_TOKEN as string,
      threadsApi: process.env.THREADS_API as string
    };
    return appConfig;

  } catch (error) {
    console.error('Error during configuration loading:', error);
    process.exit(1);
  }
}