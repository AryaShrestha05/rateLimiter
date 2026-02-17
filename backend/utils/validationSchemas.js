export const loginUserSchema = {
  email: {
    errorMessage: 'Invalid username',
    isEmail: true,
  },
  password: {
    isLength: {
      options: { min: 3 },
      errorMessage: 'Password should be at least 3 chars',
    },
  },
}
export const createKeySchema = {
  name: {
    optional: true,
    isLength: { options: { max: 255 } },
    errorMessage: 'Name must be under 255 chars',
  },
};

export const updateKeySchema = {
  bucket_capacity: {
    optional: true,
    isInt: { options: { min: 1, max: 1000 } },
    errorMessage: 'bucket_capacity must be between 1 and 1000',
  },
  refill_rate: {
    optional: true,
    isInt: { options: { min: 1, max: 100 } },
    errorMessage: 'refill_rate must be between 1 and 100',
  },
};