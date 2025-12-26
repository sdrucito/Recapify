import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {getAllPublicRecaps, getRecap} from "./dao/recapDAO.mjs";

// init express
const app = new express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};

app.use(cors(corsOptions));

/* STATIC */
app.use('/images', express.static('images')); //TODO soluzione temporanea, sarebbe da creare un'apposita api

/* ROUTES */
// GET /api/recaps
app.get('/api/recaps', (req, res) => {
  getAllPublicRecaps()
      .then(recaps => res.json(recaps))
      .catch(() => res.status(500).end());
});
// GET /api/recaps/<id>
app.get('/api/recaps/:id', async (request, response) => {
  try {
    const recap = await getRecap(request.params.id);
    if(recap.error) {
      response.status(404).json(recap);
    } else {
      response.json(recap);
    }
  }
  catch {
    response.status(500).end();
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});