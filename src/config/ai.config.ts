export const aiConfig = () => ({
  openaiApiKey: process.env.OPENAI_API_KEY,
  model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
});
