export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri:
    process.env.MONGODB_URI ??
    'mongodb://localhost:27017/headless-cms-portfolio',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  mail: {
    from: process.env.MAIL_FROM ?? 'noreply@example.com',
    smtpHost: process.env.SMTP_HOST ?? '',
    smtpPort: process.env.SMTP_PORT ?? '',
  },
  githubModels: {
    token: process.env.AI_TOKEN ?? '',
    model: process.env.AI_MODEL ?? 'gpt-4o-mini',
  },
});
