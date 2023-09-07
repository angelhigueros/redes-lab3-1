class Router {
    constructor(name) {
        this.name = name;
        this.routingTable = {};
        this.connections = {};
    }

    addConnection(router, cost) {
        this.connections[router.name] = cost;
        router.connections[this.name] = cost;
        this.routingTable[router.name] = { distance: cost, nextHop: router.name };
        router.routingTable[this.name] = { distance: cost, nextHop: this.name };
    }

    receiveVector(vector, neighborName) {
        let changed = false;
        for (let dest in vector) {
            if (!this.routingTable[dest] || this.routingTable[dest].distance > vector[dest].distance + this.connections[neighborName]) {
                this.routingTable[dest] = {
                    distance: vector[dest].distance + this.connections[neighborName],
                    nextHop: neighborName
                };
                changed = true;
            }
        }
        return changed;
    }

    sendVector() {
        for (let neighborName in this.connections) {
            if (routers[neighborName].receiveVector(this.routingTable, this.name)) {
                return true;
            }
        }
        return false;
    }

    toString() {
        let result = [];
        for (let dest in this.routingTable) {
            result.push(`Destino: ${dest}, Distancia: ${this.routingTable[dest].distance}, Siguiente salto: ${this.routingTable[dest].nextHop}`);
        }
        return result.join('\n');
    }
}

const A = new Router('A');
const B = new Router('B');
const C = new Router('C');
const D = new Router('D');
A.addConnection(B, 1);
A.addConnection(C, 4);
B.addConnection(C, 2);
C.addConnection(D, 1);

const routers = { A, B, C, D };

let changed;
do {
    changed = false;
    for (let routerName in routers) {
        if (routers[routerName].sendVector()) {
            changed = true;
        }
    }
} while (changed);

for (let routerName in routers) {
    console.log(`Router ${routerName}:\n${routers[routerName].toString()}\n`);
}
