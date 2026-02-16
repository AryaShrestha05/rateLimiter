import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './src/db.js';
import loginRouter from './routes/login.js';
import tokenRouter from './routes/tokenLogic.js';

const PgStore = connectPgSimple(session);

const app = express();

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true in production (HTTPS only)
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
    store: new PgStore({
        pool: pool,
        tableName: 'session',
    }),
}));

app.use(loginRouter);
app.use(tokenRouter);

app.get('/', (req, res) => {
  console.log(req.session);
  console.log(req.session.id);
  req.session.visited = true;
  res.status(200).send({msg: "Hello"});
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(50));
    console.log('  RATE LIMITER');
    console.log('='.repeat(50));
    console.log(`  URL: http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log('');
});
