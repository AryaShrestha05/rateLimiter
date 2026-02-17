import passport from 'passport';
import { Strategy } from 'passport-local';
import pool from '../src/db.js';
import { comparePassword } from '../utils/helpers.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, plan, created_at FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0] || null);
  } catch (error) {
    done(error, null);
  }
});

export default passport.use(
  new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user) return done(null, false, { message: 'User not found' });
      if (!comparePassword(password, user.passwords_hash)) {
        return done(null, false, { message: 'Wrong password' });
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  })
);
