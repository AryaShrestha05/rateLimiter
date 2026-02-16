import passport from 'passport';
import { Strategy } from 'passport-local';
import pool from '../src/db.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error, null);
  }
});

export default passport.use(
  new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      console.log(`Login attempt: ${email}`);
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) return done(null, false, { message: 'User not found' });
      if (user.passwords_hash !== password) return done(null, false, { message: 'Wrong password' });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  })
);
