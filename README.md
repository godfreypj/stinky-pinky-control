# Stinky Pinky Control
This Express.js application serves as the "control" component of the Stinky Pinky project. It interacts with the Stinky Pinky Brain (a Flask API) to generate new word puzzle rounds, performs sanitization checks on the generated rounds, and stores them in a Firestore database.

## Features

When pinged, the app will fetch a new round from the Stinky Pinky Brain API.

### `newRound` Service
- Makes requests to the Flask API and retrieve new word puzzle rounds.
- Handles potential API request errors and invalid response formats using custom error classes.
- Adapts authentication based on the environment:
    - In local development, uses a JWT token from the `.env` file.
    - In the deployed environment, generates an ID token using the `google-auth-library` and the SP_BRAIN url.

### `santizeRound` Service
- Sanitizes rounds to ensure uniqueness.
- Checks if a generated round contains any words that have been used in previous rounds.
- If a duplicate is found, a new round is requested from the Flask API until a unique one is generated.

### Firestore Database
- Once a unique Round is found it is stored in a Firestore database.
- Connects to Firestore using the Firebase Admin SDK, initialized with credentials fetched from either the `.env` file (locally) or Secret Manager (deployed).
- Saves unique rounds to the appropriate Firestore collection based on the current environment.
- Handles potential errors during the Firestore write operation.

### Error handling
- Utilizes custom error classes to represent different types of errors:
   - `ApiRequestError`
   - `InvalidApiResponseError`
   - `ConfigLoadingError`
   - `FirebaseInitError`
- Configures itself based on the environment (local vs. deployed)

## Deployment
This Express app is designed to be deployed to Google Cloud Run automatically upon push to the `main` branch. It is a protected branch.

## Testing
Unit tests are located in the `tests` directory.