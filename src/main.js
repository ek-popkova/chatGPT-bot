import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import config from 'config';
import {code} from 'telegraf/format'
import { oggService } from './services/oggService.js'
import { openaiService } from './services/openaiService.js'


const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.on(message('voice'), async (ctx) => {
    try {
        await ctx.reply(code('Your question was recieved, we are waiting for the server response...'));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await oggService.create(link.href, userId);
        const mp3Path = await oggService.toMp3(oggPath, userId);

        const text = await openaiService.transcription(mp3Path);

        await ctx.reply(code('Your question is:'));
        await ctx.reply(text);

        const messages = [{ role: openaiService.roles.USER, content: text }];
        const response = await openaiService.chat(messages);

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
