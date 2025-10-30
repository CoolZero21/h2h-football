import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import livereload from 'livereload';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(__dirname);

const PORT = 5000;

liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100)
})

const server = http.createServer(async (req,res) => {
    try{
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        let pathName = parsedUrl.pathname;
        let filePath = path.join(__dirname, pathName === '/' ? 'index.html' : pathName)
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

        let data ;

        if (ext === ".html") {
            data = await fs.readFile(filePath, "utf-8");
            data = data.replace('</body>', `<script src="http://localhost:35729/livereload.js?snipver=1"></script></body>`);
        } else {
            data = await fs.readFile(filePath);
        }

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