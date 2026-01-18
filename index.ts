import express from "express"
import dotenv from 'dotenv'
import path from 'path'
import cors from "cors"
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

import isJSONValid from "./src/utils/isJSONValid"

dotenv.config()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cors())
const port = 369

app.get('/', (req, res) => {
    console.log("recebido")
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})



const server = app.listen(port, () => {
    console.log(`Started on port: ${port}`)
})
const wss = new WebSocketServer({ server });


const registeredClients = new Set();
wss.on("connection", (ws) => {
    console.log("Nova conexão WebSocket");
    ws.on("close", () => {
        console.log("Conexão WebSocket fechada");
        registeredClients.delete(ws);
    });
    ws.on("message", (data) => {
        try{
            if (isJSONValid(data.toString())){
                const dataValue = JSON.parse(String(data.toString()));
                switch(dataValue.op){
                    case "register":
                        registeredClients.add(ws);
                        ws.send(JSON.stringify(
                            {
                                "message":"Registered for PC On/Off.",
                            }));
                    break;
                    case "echo":
                        ws.send(`Mensagem ecoada: ${dataValue.message}`);
                    break
                    default:
                        ws.send("Comando não reconhecido")
                    break
                }   
            }
            else wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(`Não é um json válido`);
                }
            });
        }
        catch (err) {
            console.error(err);
        }
    });

    ws.on("close", () => {
        console.log("Closed WS");
    });
});



app.get('/power/off', async (req, res) => {
    console.log("turn power off")
    res.send({message:"Chamado recebido"})

    registeredClients.forEach((client:any) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ op: "powerStateChange", state: false }));
        }
    });    
})
app.get('/power/on', async (req, res) => {
    console.log("turn power on")
    res.send({message:"Chamado recebido"})

    registeredClients.forEach((client:any) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ op: "powerStateChange", state: true }));
        }
    });    
})