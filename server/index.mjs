import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import {getAllPublicRecaps, getAllRecapsByUserId, getRecap, updateRecapVisibility} from "./dao/recapDAO.mjs";
import {getUser} from "./dao/userDAO.mjs";

// init express
const app = new express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan('dev'));

// cors
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};
app.use(cors(corsOptions));

// authentication
passport.use(new LocalStrategy(async function verify(username, password, callback){
  const user = await getUser(username, password);
  if (!user) {
    return callback(null, false, 'Incorrect username or password');
  }
  return callback(null, user);
}));

passport.serializeUser(function(user, cb){
  cb(null, user);
});
passport.deserializeUser(function(user, cb){
  cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!", //TODO: soluzione temporanea, sarebbe da non mettere hardcoded così
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/* STATIC */
app.use('/images', express.static('images')); //TODO soluzione temporanea, sarebbe da creare un'apposita api

/* ROUTES */
// GET /api/recaps
app.get('/api/recaps', (req, res) => {
  getAllPublicRecaps()
      .then(recaps => res.json(recaps))
      .catch(() => res.status(500).end());
});

// GET /api/recaps/myrecaps
app.get('/api/recaps/myrecaps', isLoggedIn, async (req, res) => {
  try {
    const recaps = await getAllRecapsByUserId(req.user.id);
    return res.json(recaps);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// GET /api/recaps/<id>
app.get('/api/recaps/:id', async (request, response) => {
  try {
    const recap = await getRecap(request.params.id);
    if(recap === null)
      return response.status(404).json(recap); //TODO: check if is ok json null

    if (recap.visibility === 'public')
      return response.json(recap);

    if (request.isAuthenticated() && request.user.id === recap.authorId) {
      return response.json(recap);
    }
    return response.status(403).json({ error: 'Not authorized' });
  }
  catch {
    response.status(500).end();
  }
});

// PATCH /api/recaps/:id/visibility
app.patch('/api/recaps/:id/visibility', isLoggedIn, async (req, res) => {
  try {
    const recapId = req.params.id;
    const { visibility } = req.body;

    // body check
    if (!visibility || !['public', 'private'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    const recap = await getRecap(recapId);
    if (!recap) {
      return res.status(404).json({ error: 'Recap not found' });
    } else if (recap.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await updateRecapVisibility(recapId, visibility);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

/* AUTH ROUTES */
// POST /api/sessions
app.post('/api/sessions',passport.authenticate('local'), function(req, res) {
  return res.status(201).json(req.user);
});
// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated())
    res.json(req.user);
  else{
    res.status(401).json({'error': 'Not Authenticated'});
  }
});
// DELETE /api/sessions/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(()=>{
    res.end();
  });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});