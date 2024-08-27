// src/interfaces/config.ts

export interface Config {
    apiUrl: string;
    workstationJwt: string;
    projectEnv: string;
    roundCollection: string;
    db: FirebaseFirestore.Firestore;
    threadsContApi: string;
    threadsPostApi: string;
    threadsToken: string;
  }