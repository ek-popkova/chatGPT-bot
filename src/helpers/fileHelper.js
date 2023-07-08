import {unlink} from 'fs/promises'

export async function removeFile(path) {
    try {
        await unlink(path);
        console.log("Successfully removed a file from path", path);
    }
    catch (e) {
        console.log("Error while removing file from path", path, e.message);
    }
};