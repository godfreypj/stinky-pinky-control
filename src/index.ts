import express from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
import cors from "cors";

const app = express();
app.use(cors());

dotenv.config();

app.get('/', async (req, res) => {
  const name = process.env.NAME || 'World';

  try {
    const apiUrl = process.env.API_SERVICE; 
    if (!apiUrl) {
      throw new Error('API_SERVICE environment variable not set');
    }

    const response = await axios.get(apiUrl + 'api/generate', {
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    const apiData = response.data;

    res.send(`Hello ${name}!

    API Response:
    ${JSON.stringify(apiData, null, 2)}`);
  } catch (error) {
    console.error('Error fetching data from API:', error);
    res.status(500).send('Error fetching data from API' + error);
  }
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
