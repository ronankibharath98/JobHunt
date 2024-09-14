import DataUriParser from 'datauri/parser.js';
import path from 'path';

const getDataUri = (file) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString(); // Get file extension
    const mimeType = `image/${extName.slice(1)}`; // Remove the dot from the extension to construct the MIME type
    const base64 = file.buffer.toString('base64'); // Convert file buffer to base64
    return parser.format(extName,file.buffer, base64); // Use the parser.format method correctly
}

export default getDataUri;
