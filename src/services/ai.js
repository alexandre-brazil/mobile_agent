export async function chamarIA(mensagemCliente) {
  const prompt = `Você é o atendente virtual da Mobile Clinic, uma loja especializada em venda e conserto de celulares em Lucas do Rio Verde - MT.

Ajude com: aparelhos disponíveis, consertos, orçamentos, garantia, tempo de serviço, formas de pagamento, endereço/horário e atendimento via WhatsApp.
Seja claro, direto e profissional. Não invente informações. Ofereça falar com humano se necessário.

Mensagem do cliente: "${mensagemCliente}"`;

  const r = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistralai/mixtral-8x7b-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3
    })
  });

  const j = await r.json();
  if (!j.choices?.[0]) throw new Error('Resposta inválida da IA');
  return j.choices[0].message.content;
}
