import { genSaltSync, hashSync, compareSync } from 'bcrypt';

const saltRounds = 10;

export const hashPassword = (password) => {
  const salt = genSaltSync(saltRounds);
  return hashSync(password, salt);
};

export const comparePassword = (password, hash) => {
  return compareSync(password, hash);
};