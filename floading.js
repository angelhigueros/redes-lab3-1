class Flooding {
    constructor() {
        this.pedir();
    }

    pedir() {
        this.me = prompt("Ingresa el nombre del nodo");
        const misVecinos = prompt("Ingresa los vecinos separados por coma");
        this.vecinos = misVecinos.split(",");
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
while (opcion !== "3") {
    console.log("\n\n1. Enviar mensaje");
    console.log("2. Recibir mensaje");
    console.log("3. Salir");
    opcion = prompt("Ingrese opción");
    if (opcion === "1") {
        const mensaje = prompt("Ingrese el mensaje");
        const destino = prompt("Ingrese el destino");
        flooding.send_message(mensaje, destino);
    } else if (opcion === "2") {
        const recibido = prompt("Ingrese el mensaje de la forma 'destino,mensaje,emisor'");
        const tupla = recibido.split(",");
        const destino = tupla[0];
        const mensaje = tupla[1];
        const emisor = tupla[2];
        const tabla_visitados = prompt("Ingrese la tabla de visitados de la forma 'nodo1,nodo2,nodo3'");
        flooding.receive_message(mensaje, emisor, tabla_visitados);
    }
}
