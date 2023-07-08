import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { removeFile } from "../helpers/fileHelper.js";

const _dirname = dirname(fileURLToPath(import.meta.url));

class OggService {
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
                    .on('end', () => {
                        removeFile(input);
                        console.log("Successfully converted to .mp3 .ogg from path", input);
                        resolve(outputPath);
                    })
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
            const oggPath = resolve(_dirname, '../../voices', `${filename}.ogg`);
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            });
            return new Promise(resolve => {
                const stream = createWriteStream(oggPath);
                response.data.pipe(stream);
                stream.on('finish', () => {
                    console.log("Successfully downloaded .ogg from telegram to", filename);
                    resolve(oggPath);
                });
            })      
        }
        catch (e) {
            console.log("Error while downloading .ogg file from url ", url, e.message);
        }        
    }

}

export const oggService = new OggService();