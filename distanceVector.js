const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class DistanceVector {
    constructor() {
        this.hop_table = {};
        this.nodos = [];
        this.vecinos = [];
        this.pesos = [];
        this.tamaño = 0;
        this.tabla = {};
        this.old_tabla = {};

        this.init();
    }

    async init() {
        await this.pedir();
        this.menu();
    }

    async pedir() {
        this.me = await this.question("Ingresa el nombre del nodo: ");
        this.nodos = (await this.question("Ingresa todos los nodos de la red (separados por coma): ")).split(",");
        this.vecinos = (await this.question("Ingresa los vecinos (separados por coma): ")).split(",");
        this.vecinos = this.vecinos.sort();
        this.hop_table[this.me] = this.me;

        this.vecinos.forEach(vecino => {
            this.hop_table[vecino] = vecino;
        });

        this.pesos = (await this.question("Ingresa los pesos de los vecinos (separados por coma): ")).split(",");
        this.tamaño = this.nodos.length;

        let infinitos = [];
        let cont = 0;
        let tabla_array = [];

        this.nodos.forEach(n => {
            if (n === this.me) {
                tabla_array.push([n, 0]);
            } else if (this.vecinos.includes(n)) {
                tabla_array.push([n, parseInt(this.pesos[cont])]);
                cont += 1;
            } else {
                tabla_array.push([n, Infinity]);
            }
            infinitos.push([n, Infinity]);
        });

        this.tabla[this.me] = tabla_array;

        this.nodos.forEach(n => {
            if (n !== this.me) {
                this.tabla[n] = infinitos;
            }
        });

        this.old_tabla = JSON.parse(JSON.stringify(this.tabla));
        console.log(this.tabla);
    }

    menu() {
        const options = [
            "Recibir informacion de un nodo",
            "Obtener tabla de enrutamiento",
            "Recibir mensaje",
            "Enviar mensaje",
            "Actualizar tabla",
            "Salir"
        ];

        rl.question("Ingresa una opción (1-6): ", async (opcion) => {
            switch (opcion) {
                case "1":
                    await this.receive_info_from_node();
                    break;
                case "2":
                    console.log(this.get_own_table());
                    break;
                case "3":
                    await this.receive_message();
                    break;
                case "4":
                    // Agrega aquí la lógica para enviar mensaje
                    break;
                case "5":
                    this.update_table();
                    console.log(this.tabla);
                    break;
                case "6":
                    rl.close();
                    return;
                default:
                    console.log("Opción no válida. Por favor, elige una opción del 1 al 6.");
                    break;
            }

            this.menu();
        });
    }

    async receive_info_from_node() {
        const sender = await this.question("Ingresa el nombre del nodo que envía: ");
        const info = await this.question("Ingresa la información que envía: ");
        this.tabla[sender] = JSON.parse(info);
        console.log(this.tabla[sender]);
        this.menu();
    }

    async receive_message() {
        const emisor = await this.question("Ingresa el nombre del nodo emisor: ");
        const receptor = await this.question("Ingresa el nombre del nodo receptor: ");
        const mensaje = await this.question("Ingresa el mensaje: ");

        if (receptor === this.me) {
            console.log(`Mensaje recibido de ${emisor} contenido: ${mensaje}`);
        } else {
            console.log("Emisor: ", emisor);
            console.log("Enviar mensaje:", mensaje);
            console.log("Siguiente nodo:", this.get_next_node(receptor));
        }

        this.menu();
    }

    question(prompt) {
        return new Promise((resolve) => {
            rl.question(prompt, (answer) => {
                resolve(answer);
            });
        });
    }

    brute_force(key, Node) {
        const array = this.tabla[key];
        for (const n of array) {
            if (n[0] === Node) {
                return n;
            }
        }
    }

    set_new_cost(key, Node, cost) {
        const array = this.tabla[key];
        for (const n of array) {
            if (n[0] === Node) {
                n[1] = cost;
            }
        }
    }

    update_table() {
        for (const n of this.nodos) {
            if (n !== this.me) {
                const [objetivo, costo] = this.brute_force(this.me, n);
                for (const n1 of this.nodos) {
                    if (n1 !== this.me && n1 !== objetivo) {
                        const costo1 = this.brute_force(n1, objetivo)[1];
                        const costo2 = this.brute_force(this.me, n1)[1];
                        if (costo1 + costo < costo2) {
                            this.set_new_cost(this.me, n1, costo1 + costo);
                            this.hop_table[n1] = objetivo;
                        }
                    }
                }
            }
        }

        if (JSON.stringify(this.old_tabla) === JSON.stringify(this.tabla)) {
            console.log("Convergencia alcanzada");
        }

        this.old_tabla = JSON.parse(JSON.stringify(this.tabla));
    }

    get_own_table() {
        return this.tabla[this.me];
    }

    get_next_node(destination) {
        return this.hop_table[destination];
    }
}

const distanceVector = new DistanceVector();
