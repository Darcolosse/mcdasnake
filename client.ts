import * as net from "net";

// client.ts
// Usage: ts-node client.ts "message" [host] [port]
// Example: ts-node client.ts "Bonjour serveur" 127.0.0.1 8080


const message = process.argv[2] ?? "Bonjour serveur";
const host = process.argv[3] ?? "127.0.0.1";
const port = parseInt(process.argv[4] ?? "8080", 10);

const socket = net.createConnection({ host, port }, () => {
    console.log(`Connecté à ${host}:${port}`);
    socket.write(message);
});

socket.setEncoding("utf8");

socket.on("data", (data: string) => {
    console.log("Réponse du serveur:", data);
    socket.end(); // fermer après la première réponse
});

socket.on("end", () => {
    console.log("Déconnecté du serveur");
});

socket.on("error", (err: Error) => {
    console.error("Erreur:", err.message);
});