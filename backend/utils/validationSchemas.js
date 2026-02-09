export const loginUserSchema = {
  email: {
    errorMessage: 'Invalid username',
    isEmail: true,
  },
  password: {
    isLength: {
      options: { min: 3 },
      errorMessage: 'Password should be at least 8 chars',
    },
  },
}