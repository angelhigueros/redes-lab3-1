class Flooding {
    constructor(nodeName) {
        this.node_name = nodeName;
        this.neighbors = [];
    }

    setNeighbors(neighbors) {
        // Establecer vecinos
        this.neighbors = neighbors;
    }

    sendMessage(sender, receiver, message) {
        // En flooding, simplemente enviamos el mensaje a todos los vecinos,
        // independientemente de si es el destinatario final o no.
        for (const neighbor of this.neighbors) {
            if (neighbor !== sender) { // No reenviar al emisor original
                console.log(`Reenviar mensaje de ${sender} a ${receiver} a través de ${neighbor}`);
            }
        }
    }

    receiveMessage(sender, receiver, message) {
        // Simular la recepción de un mensaje
        if (receiver === this.node_name) {
            console.log(`Mensaje recibido de ${sender}: ${message}`);
        } else {
            // En caso de que este nodo no sea el destinatario final, reenviamos el mensaje.
            this.sendMessage(sender, receiver, message);
        }
    }
}

// Ejemplo de uso
const flooding = new Flooding('NodeA');
flooding.setNeighbors(['NodeB', 'NodeC']);
flooding.receiveMessage('NodeB', 'NodeA', 'Hola, soy un mensaje');
