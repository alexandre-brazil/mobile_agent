import { chamarIA } from '../services/ai.js';
import { enviarMensagemWhatsApp } from '../services/whatsapp.js';
import { ensureSession, getSession, setMode } from '../db/sessions.js';
import { appendMessage } from '../db/messages.js';

function pediuHumano(texto = '') {
  return /(humano|atendente|pessoa|falar com humano|falar com atendente)/i.test(texto);
}

export default async function webhookRoutes(fastify) {
  // Verificação
  fastify.get('/webhook', async (req, reply) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return reply.code(200).send(challenge);
    }
    return reply.code(403).send();
  });

  // Receber mensagem
  fastify.post('/webhook', async (req, reply) => {
    try {
      const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (msg && msg.type === 'text') {
        const from = msg.from;
        const texto = msg.text.body;
        fastify.log.info({ from, texto }, 'Mensagem recebida');

        await ensureSession(from);
        await appendMessage(from, 'user', texto);
        let session = await getSession(from);

        // Pedido de humano
        if (pediuHumano(texto) && session?.mode !== 'human') {
          await setMode(from, 'human');
          await appendMessage(from, 'system', '[handoff: human]');
          await enviarMensagemWhatsApp(from, 'Certo! Vou te passar para um atendente humano 👩‍💻');
          return reply.code(200).send();
        }

        // Já em modo humano → não chama a IA
        session = await getSession(from);
        if (session?.mode === 'human') {
          await enviarMensagemWhatsApp(from, 'Um atendente humano vai te responder por aqui em instantes. 🙂');
          return reply.code(200).send();
        }

        // Modo bot → IA
        const resposta = await chamarIA(texto);
        await enviarMensagemWhatsApp(from, resposta);
        await appendMessage(from, 'assistant', resposta);
      }
      reply.code(200).send(); // WhatsApp exige 200
    } catch (e) {
      fastify.log.error(e);
      reply.code(200).send(); // Sempre 200
    }
  });
}
