const io = require('socket.io')();

// Configura los nodos de la red simulada.
const nodes = {
    A: { username: 'a@alumchat.xyz', neighbors: ['B', 'C'] },
    B: { username: 'b@alumchat.xyz', neighbors: ['A', 'C'] },
    C: { username: 'c@alumchat.xyz', neighbors: ['A', 'B'] },
    // Agrega más nodos según sea necesario.
};

// Inicializa las conexiones simuladas entre los nodos.
io.on('connection', (socket) => {
    const nodeName = socket.handshake.query.node;
    const node = nodes[nodeName];

    socket.on('sendPacket', (packet, nodeName) => {
        // Supongamos que tienes una función para procesar paquetes recibidos en tu nodo.
        // Esta función se llama cuando un nodo recibe un paquete.
        function procesarPaqueteRecibido(packet, nodeName) {
            const destinationNodeName = packet.destination;
            const sourceNodeName = packet.source;
            const distanceToDestination = packet.distance;

            // Actualiza la tabla de enrutamiento si es necesario.
            if (
                !nodes[nodeName].routingTable[destinationNodeName] ||
                nodes[nodeName].routingTable[destinationNodeName].distance > distanceToDestination
            ) {
                // Actualiza la tabla de enrutamiento con la nueva distancia y el próximo salto.
                nodes[nodeName].routingTable[destinationNodeName] = {
                    distance: distanceToDestination,
                    nextHop: sourceNodeName, // El próximo salto es el nodo que envió el paquete.
                };

                // Establece una bandera para indicar que la tabla de enrutamiento cambió.
                nodes[nodeName].routingTableChanged = true;
            }
        }

        // Luego, en el evento 'sendPacket', después de procesar el paquete, puedes llamar a esta función.
        socket.on('sendPacket', (packet) => {
            // Procesa el paquete y actualiza la tabla de enrutamiento.
            procesarPaqueteRecibido(packet, socket.handshake.query.node);

            // Envía el paquete al nodo de destino.
            const destinationNodeName = packet.destination;
            const destinationNode = nodes[destinationNodeName];
            io.to(destinationNode.username).emit('receivePacket', packet);
        });

    });

    // Registra a cada nodo como una sala en socket.io para simular las conexiones.
    socket.join(node.username);
});

// Inicia el servidor de socket.io en el puerto 3000 (o el puerto que prefieras).
io.listen(3000);

// Función para inicializar la simulación.
function iniciarSimulacion() {
    // Implementa la lógica de los algoritmos de enrutamiento y la simulación aquí.
    // Puedes utilizar el evento 'sendPacket' para enviar paquetes entre los nodos.
}

// Inicia la simulación.
iniciarSimulacion();
