import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import config from 'config';
import {code} from 'telegraf/format'
import { telegramManager } from './managers/telegramManager.js';


const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.on(message('voice'), async (ctx) => {
    try {
        await telegramManager.voiceMessageTextAnswer(ctx);          
    }
    catch (e) {
        console.log('Error while answering the voice message', e.message);
        await ctx.reply(code('The internal error occured, please, try again later.'));
    }   
});

bot.command('start', async (ctx) => {
    await ctx.reply(code("Hi! I can send your voice messages to ChatGPT, just record your question here and I'll ask chatGPT for you."));
});

bot.launch();

//stop the bot if node.js stops
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
