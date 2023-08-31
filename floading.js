const readline = require('readline');

class Flooding {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.pedir();
    }

    pedir() {
        this.rl.question("Ingresa el nombre del nodo> ", (me) => {
            this.me = me;
            this.rl.question("Ingresa los vecinos separados por coma> ", (misVecinos) => {
                this.vecinos = misVecinos.split(",");
                this.rl.close();
            });
        });
    }

    send_message(message, destino) {
        console.log(`Enviando mensaje a mis vecinos: ${this.vecinos}`);
        console.log(`Destinatario del mensaje: ${destino}`);
        console.log(`Tabla de visitados: [${this.me}]`);
        console.log(`Mensaje: ${message}`);
    }

    receive_message(message, emisor, tabla_visitados) {
        if (tabla_visitados.includes(this.me)) {
            console.log(`Mensaje recibido de: ${emisor}, el mensaje es: ${message}`);
        } else {
            console.log("Enviando mensaje a mis vecinos: " + this.vecinos);
            console.log(`Destinatario del mensaje: ${destino}, emisor: ${emisor}`);
            console.log(`Tabla de visitados: [${tabla_visitados}, ${this.me}]`);
        }
    }
}

const flooding = new Flooding();

let opcion = "0";
const mainLoop = () => {
    console.log("\n\n1. Enviar mensaje");
    console.log("2. Recibir mensaje");
    console.log("3. Salir");
    flooding.rl.question("Ingrese opción> ", (opcion) => {
        if (opcion === "1") {
            flooding.rl.question("Ingrese el mensaje> ", (mensaje) => {
                flooding.rl.question("Ingrese el destino> ", (destino) => {
                    flooding.send_message(mensaje, destino);
                    mainLoop();
                });
            });
        } else if (opcion === "2") {
            flooding.rl.question("Ingrese el mensaje de la forma 'destino,mensaje,emisor'> ", (recibido) => {
                const tupla = recibido.split(",");
                const destino = tupla[0];
                const mensaje = tupla[1];
                const emisor = tupla[2];
                flooding.rl.question("Ingrese la tabla de visitados de la forma 'nodo1,nodo2,nodo3'> ", (tabla_visitados) => {
                    flooding.receive_message(mensaje, emisor, tabla_visitados);
                    mainLoop();
                });
            });
        } else if (opcion === "3") {
            flooding.rl.close();
        } else {
            console.log("Opción no válida.");
            mainLoop();
        }
    });
};

mainLoop();
