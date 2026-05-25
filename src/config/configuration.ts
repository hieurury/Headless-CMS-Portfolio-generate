export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/headless-cms-portfolio',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  },
});
