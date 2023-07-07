import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const _dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
    constructor() { 
        ffmpeg.setFfmpegPath(installer.path);
    }
    
    async toMp3(input, output) { 
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`);
            return new Promise((resolve, reject) => {
                ffmpeg(input)
                    .inputOptions('-t 30')
                    .output(outputPath)
                    .on('end', () => resolve(outputPath))
                    .on('error', (err) => reject(err.message))
                    .run();
            })
        }
        catch (e) {
            console.log("Error while converting into mp3 file", input, e.message);
        }
    }

    async create(url, filename) { 
        try {
            const oggPath = resolve(_dirname, '../voices', `${filename}.ogg`);
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            });
            return new Promise(resolve => {
                const stream = createWriteStream(oggPath);
                response.data.pipe(stream);
                stream.on('finish', () => resolve(oggPath));
            })      
        }
        catch (e) {
            console.log("Error while downloading .ogg file from url ", url, e.message);
        }        
    }

}

export const ogg = new OggConverter();