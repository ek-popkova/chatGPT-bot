import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import config from 'config';
import {code} from 'telegraf/format'
import { ogg } from './ogg.js'
import { openai } from './openai.js'


const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(code('Your question was recieved, we are waiting for the server response...'));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg.create(link.href, userId);
        const mp3Path = await ogg.toMp3(oggPath, userId);

        const text = await openai.transcription(mp3Path);

        await ctx.reply(code('Your question is:'));
        await ctx.reply(text);
        
        const messages = [{ role: openai.roles.USER, content: text }];
        const response = await openai.chat(messages);

        await ctx.reply(code('The answer is:'));
        await ctx.reply(response.content);
           
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
