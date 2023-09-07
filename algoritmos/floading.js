const readline = require('readline');

class Flooding {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.setup();
    }

    setup() {
        this.rl.question("Ingresa el nombre del nodo> ", (me) => {
            this.me = me;
            this.rl.question("Ingresa los vecinos separados por coma> ", (misVecinos) => {
                this.vecinos = misVecinos.split(",");
                this.mainLoop();
            });
        });
    }

    send_message() {
        this.rl.question("Ingrese el mensaje> ", (mensaje) => {
            this.rl.question("Ingrese el destino> ", (destino) => {
                console.log(`Enviando mensaje a mis vecinos: ${this.vecinos}`);
                console.log(`Destinatario del mensaje: ${destino}`);
                console.log(`Tabla de visitados: [${this.me}]`);
                console.log(`Mensaje: ${mensaje}`);
                this.mainLoop();
            });
        });
    }

    receive_message() {
        this.rl.question("Ingrese el mensaje de la forma 'destino,mensaje,emisor'> ", (recibido) => {
            const tupla = recibido.split(",");
            const destino = tupla[0];
            const mensaje = tupla[1];
            const emisor = tupla[2];
            this.rl.question("Ingrese la tabla de visitados de la forma 'nodo1,nodo2,nodo3'> ", (tabla_visitados) => {
                const visitados = tabla_visitados.split(",");
                if (visitados.includes(this.me)) {
                    console.log(`Mensaje recibido de: ${emisor}, el mensaje es: ${mensaje}`);
                } else {
                    console.log("Enviando mensaje a mis vecinos: " + this.vecinos);
                    console.log(`Destinatario del mensaje: ${destino}, emisor: ${emisor}`);
                    console.log(`Tabla de visitados: [${visitados}, ${this.me}]`);
                }
                this.mainLoop();
            });
        });
    }

    mainLoop() {
        console.log("\n\n1. Enviar mensaje");
        console.log("2. Recibir mensaje");
        console.log("3. Salir");
        this.rl.question("Ingrese opción> ", (opcion) => {
            switch (opcion) {
                case "1":
                    this.send_message();
                    break;
                case "2":
                    this.receive_message();
                    break;
                case "3":
                    console.log("Finalizando programa.");
                    this.rl.close();
                    break;
                default:
                    console.log("Opción no válida.");
                    this.mainLoop();
                    break;
            }
        });
    }
}

const flooding = new Flooding();
