const readline = require('readline');

const menus = require('./menus'); // Reemplaza con la ubicación correcta de tus archivos
const Cliente = require('./cliente_Fl');
const Borrar_Cliente = require('./cliente_Fl').Borrar_Cliente;
const Flooding = require('./Flooding'); // Importa la clase DistanceVector

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

menus.menu();
rl.question('\n>> ', function(opcion) {
    while (opcion !== "4") {

        // Registro
        if (opcion === "1") {
            rl.question('Usuario: ', function(jid) {
                rl.question('Contraseña: ', function(password) {
                    if (cliente_FL.register(jid, password)) {
                        console.log("Registro completado de manera correcta");
                    } else {
                        console.log("Registro NO completado");
                    }
                    menus.menu();
                    rl.question('\n>> ', function(opcion) {});
                });
            });
        }

        // Inicio de sesión
        else if (opcion === "2") {
            rl.question('Usuario: ', function(jid) {
                rl.question('Contraseña: ', function(password) {
                    // Obtener el nombre de usuario (node_name) del JID (por ejemplo, "usuario@servidor.com" se convierte en "usuario")
                    const node = jid.split('@')[0];
                    const node_name = node.split("_")[0].toUpperCase();
                    const node_weight = 1;

                    // Crear una instancia de DistanceVector con el node_name obtenido
                    const distance_vector = new Flooding(node_name);

                    // Realiza las operaciones necesarias aquí
                    // ...

                    // Pasa la instancia del algoritmo Distance Vector
                    const client = new Cliente(jid, password, distance_vector);
                    client.connect({ disable_starttls: true });
                    client.process({ forever: false });

                    menus.menu();
                    rl.question('\n>> ', function(opcion) {});
                });
            });
        }

        // Eliminar cuenta
        else if (opcion === "3") {
            rl.question('Usuario: ', function(jid) {
                rl.question('Contraseña: ', function(password) {
                    const client = new Borrar_Cliente(jid, password);
                    client.connect({ disable_starttls: true });
                    client.process({ forever: false });

                    menus.menu();
                    rl.question('\n>> ', function(opcion) {});
                });
            });
        }

        else {
            console.log("\nOpción NO válida, ingrese de nuevo por favor.");
            menus.menu();
            rl.question('\n>> ', function(opcion) {});
        }
    }
    rl.close();
});
