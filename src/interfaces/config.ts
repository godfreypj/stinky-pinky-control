// src/interfaces/config.ts

export interface Config {
    apiUrl: string;
    workstationJwt: string;
    projectEnv: string;
    roundCollection: string;
    db: FirebaseFirestore.Firestore;
    threadsApi: string;
    threadsToken: string;
  }