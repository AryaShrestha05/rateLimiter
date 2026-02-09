import express from 'express';
import loginRouter from './routes/login.js';
import tokenRouter from './routes/tokenLogic.js';


const app = express();

app.use(express.json());
app.set('trust proxy', true);

app.use(loginRouter);
app.use(tokenRouter);

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
