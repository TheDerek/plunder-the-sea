import express from "express"
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
//app.use(express.static(path.join(__dirname, '../client/build')));

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

//app.get("/game", (request, response) => {
//  response.sendFile(path.join(__dirname, '../client/build/index.html'));
//});

const port = 8765;
app.listen(port, () => {
  console.log(`Listening to http://localhost:${port}`);
});
