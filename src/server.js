import Fastify from 'fastify';
import dotenv from 'dotenv';
dotenv.config();

const app = Fastify({ logger: true });

await app.register(import('@fastify/formbody'));
await app.register(import('@fastify/cors'), { origin: true });

// rotas
const webhookRoutes = (await import('./routes/webhook.js')).default;
await app.register(webhookRoutes);

const port = process.env.PORT || 3000;
app.listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`Servidor rodando em http://localhost:${port}`))
  .catch(err => { app.log.error(err); process.exit(1); });
