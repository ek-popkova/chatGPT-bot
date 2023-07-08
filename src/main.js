import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import config from 'config';
import { telegramManager } from './managers/telegramManager.js';

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('start', async (ctx) => {
    await telegramManager.initalCommand(ctx, "Hi! I can send your messages to ChatGPT, just record your question as a voice or text message here and I'll ask chatGPT for you.");
});

bot.command('new', async (ctx) => {
    await telegramManager.initalCommand(ctx, "New dialog created. I'm waiting for your voice or message");
});

bot.on(message('voice'), async (ctx) => {
    await telegramManager.voiceMessageVoiceAnswer(ctx);  
});

bot.on(message('text'), async (ctx) => {
    await telegramManager.textMessageTextAnswer(ctx);  
});

bot.launch();

//stop the bot if node.js stops
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
