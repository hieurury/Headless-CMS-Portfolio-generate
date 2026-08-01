export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/headless-cms-portfolio',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'change-this-access-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-this-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  email: {
    gmailUser: process.env.GMAIL_USER ?? '',
    gmailPassword: process.env.GMAIL_PASSWORD ?? '',
  },
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  githubModels: {
    token: process.env.AI_TOKEN ?? '',
    model: process.env.AI_MODEL ?? 'gpt-4o-mini',
  },
});
