import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5000;


const server = http.createServer(async (req,res) => {
    try{
        let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url)
        const ext = path.extname(filePath)
        const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        }[ext] || 'text/plain';

        const data = await fs.readFile(filePath);
        res.writeHead(200, {'content-type': contentType});
        res.end(data);
    } catch (err){
        res.writeHead(404, { 'content-type': 'text/plain' })
        res.end('404 not found')
    }

})

server.listen(PORT, () =>{
    console.log(`Server running on ${PORT} port`);
})