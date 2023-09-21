//Importaciones
// Importaciones de módulos de Node.js y otras bibliotecas

// Importaciones relacionadas con slixmpp y asyncio
const { ClientXMPP } = require('slixmpp');
const { IqError, IqTimeout } = require('slixmpp.exceptions');
const { ElementTree: ET } = require('slixmpp.xmlstream.stanzabase');
const { ainput, aprint } = require('aioconsole');
const { Future } = require('asyncio');
const { Message } = require('slixmpp');
const re = require('re'); // Asumiendo que 're' es una biblioteca personalizada

// Importaciones relacionadas con la interfaz de usuario (si estás usando una GUI)
const tk = require('tkinter'); // Asumiendo que 'tkinter' está disponible
const { messagebox } = tk;

// Importaciones personalizadas (menus y utils)
const menus = require('./menus'); // Ajusta la ubicación correcta del archivo
const { print_rojo, print_verde, print_amarillo, print_azul, print_magenta, print_cyan } = require('./utils'); // Ajusta la ubicación correcta del archivo
const base64 = require('base64'); // Asumiendo que 'base64' es una biblioteca personalizada
const math = require('math'); // Asumiendo que 'math' es una biblioteca personalizada
const os = require('os'); // Asumiendo que 'os' es una biblioteca personalizada


//Funcion de registrar
const xmpp = require('xmpp');

function register(client, password) {
    const jid = new xmpp.JID(client);
    const account = new xmpp.Client(jid.getDomain(), { debug: [] });
    account.connect();
    
    return new Promise((resolve, reject) => {
        account.on('online', () => {
            try {
                const registrationInfo = {
                    username: jid.getNode(),
                    password: password
                };

                xmpp.features.register(account, jid.getDomain(), registrationInfo, (result) => {
                    const success = result === 'ok';
                    resolve(success);
                    account.disconnect();
                });
            } catch (error) {
                reject(error);
                account.disconnect();
            }
        });

        account.on('error', (error) => {
            reject(error);
            account.disconnect();
        });
    });
}

//const { ElementTree: ET } = require('slixmpp.xmlstream.stanzabase');
//const { ainput, aprint } = require('aioconsole');
const asyncio = require('asyncio');
const re = require('re'); // Asumiendo que 're' es una biblioteca personalizada
const menus = require('./menus'); // Ajusta la ubicación correcta del archivo
const { print_rojo, print_azul } = require('./utils'); // Ajusta la ubicación correcta del archivo

class Cliente extends ClientXMPP {
    constructor(jid, password, flooding) {
        super(jid, password);
        this.flooding = flooding;
        this.name = jid.split('@')[0];
        this.is_connected = false;
        this.actual_chat = '';
        this.client_queue = new asyncio.Queue();
        this.received_messages = [];

        // Generado por IA para los diferentes plugins que se usarán
        this.register_plugin('xep_0030'); // Service Discovery
        this.register_plugin('xep_0199'); // Ping
        this.register_plugin('xep_0045'); // MUC
        this.register_plugin('xep_0085'); // Notifications
        this.register_plugin('xep_0004'); // Data Forms
        this.register_plugin('xep_0060'); // PubSub
        this.register_plugin('xep_0066'); // Out of Band Data
        this.register_plugin('xep_0363'); // HTTP File Upload

        // Eventos
        this.add_event_handler('session_start', this.start.bind(this));
        this.add_event_handler('subscription_request', this.handler_presencia.bind(this));
        this.add_event_handler('message', this.chat.bind(this));
    }

    // FUNCIONES DE CONTACTOS Y CHATS

    async handler_presencia(presence) {
        // Si se tiene solicitud
        if (presence.type === 'subscribe') {
            try {
                this.send_presence_subscription({
                    pto: presence.from,
                    ptype: 'subscribed',
                });
                await this.get_roster();
                this.mostrar_notificacion(`Solicitud de suscripción aceptada de ${presence.from.split('@')[0]}`);
            } catch (e) {
                console.log(`Error accepting subscription request: ${e.iq.error.text}`);
            }
        } else {
            // Notificación si está logeado
            if (this.is_connected) {
                if (presence.type === 'available') {
                    this.mostrar_presencia(presence, true);
                } else if (presence.type === 'unavailable') {
                    this.mostrar_presencia(presence, false);
                } else {
                    this.mostrar_presencia(presence, null);
                }
            }
        }
    }

    async chat(message) {
        // Chat normal
        if (message.type === 'chat') {
            const user = message.from.split('@')[0];
            const node = user.split('_')[0].toUpperCase();
            const mensaje = message.body;

            try {
                if (!this.received_messages.some(([node, msg]) => node === node && msg === mensaje)) {
                    this.mostrar_notificacion(`Tienes una comunicación de ${node}>> ${mensaje}`);
                    this.received_messages.push([node, mensaje]);
                    await this.enviar_mensaje_broadcast(mensaje);
                }
            } catch (e) {
                // Si el mensaje es con el que chatea
                if (user === this.actual_chat.split('@')[0]) {
                    print_azul(`${user}: ${message.body}`);
                } else {
                    this.mostrar_notificacion(`Tienes una comunicación de ${node}>> ${mensaje}`);
                }
            }
        }
    }

    mostrar_notificacion(mensaje) {
        print_rojo(mensaje);
        console.log('v');
    }

    async enviar_mensaje_broadcast(message_body) {
        try {
            const roster = this.client_roster;

            for (const jid in roster) {
                if (jid !== this.boundjid.bare) {
                    this.send_message({
                        mto: jid,
                        mbody: message_body,
                        mtype: 'chat',
                    });
                }
            }

            console.log('Message sent to all contacts except yourself.');
        } catch (e) {
            console.log('Error sending message:', e);
        }
    }

    mostrar_presencia(presence, is_available) {
        // Verificaciones previas
        if (!presence.from.split('/')[0] === this.boundjid.bare && !presence.from.includes('conference')) {
            let show = 'available';

            if (is_available === false) {
                show = 'offline';
            } else if (is_available !== null) {
                show = presence.show;
            }

            const user = presence.from.split('/')[0];
            const status = presence.status;
            let notification_message = '';

            if (status !== '') {
                notification_message = `${user} esta ${show} - ${status}`;
            } else {
                notification_message = `${user} esta ${show}`;
            }

            this.mostrar_notificacion(notification_message);
        }
    }

    async anadir_contacto() {
        const jid_to_add = await ainput('Ingresa el JID del usuario que deseas agregar (Ejemplo: usuario@servidor.com): ');
        try {
            this.send_presence_subscription({ pto: jid_to_add });
            console.log(`Solicitud de suscripción enviada a ${jid_to_add}`);
            await this.get_roster();
        } catch (e) {
            console.log(`Error al mandar suscrpcion: ${e.iq.error.text}`);
        }
    }

    async eliminar_contacto() {
        try {
            const jid_to_remove = await ainput('Ingresa el JID del contacto que deseas eliminar: ');
            await this.del_roster_item(jid_to_remove);
            console.log(`El contacto ${jid_to_remove} ha sido eliminado de tu lista de contactos.`);
        } catch (e) {
            console.log(`Error al eliminar el contacto: ${e.iq.error.text}`);
        }
    }

    async mostrar_status_contacto() {
        const roster = this.client_roster;
        const contacts = Object.keys(roster);
        const contact_list = [];

        if (!contacts.length) {
            console.log('Sin contactos.');
            return;
        }

        for (const jid of contacts) {
            const user = jid;
            const connection = roster.presence(jid);
            let show = 'available';
            let status = '';

            for (const [answer, presence] of Object.entries(connection)) {
                if (presence.show) {
                    show = presence.show;
                }
                if (presence.status) {
                    status = presence.status;
                }
            }

            contact_list.push([user, show, status]);
        }

        console.log('\nLista de contactos:');
        for (const c of contact_list) {
            console.log(`Contacto: ${c[0]}`);
            console.log(`Estado: ${c[1]}`);
            //console.log(`Mensaje de estado: ${c[2]}`);
            console.log('');
        }
        console.log('');
    }

    async add_neighbors() {
        try {
            const roster = this.client_roster;

            for (const jid in roster) {
                if (re.test(jid, '^[a-zA-Z0-9]+_g9@alumchat\\.xyz$')) {
                    const node_name = jid.split('_')[0];
                    const node = jid.split('@')[0];

                    if (node !== this.name) {
                        this.flooding.neighbors.push(node_name);
                    }
                }
            }

            console.log('Vecinos linkeados.');
        } catch (e) {
            console.log('Error al linkear con vecinos:', e);
        }
    }

    async mostrar_detalles_vecinos(flooding) {
        const vecinos = flooding.neighbors;

        if (vecinos.length) {
            console.log('Vecinos:');
            for (const vecino of vecinos) {
                console.log(`${vecino}`);
            }
        } else {
            console.log('No hay vecinos disponibles.');
        }
    }

    async enviar_mensaje_contacto() {
        const jid = await ainput('Ingrasa el JID del usuario\n');
        this.actual_chat = jid;
        await aprint('\nPresiona x y luego enter para salir\n');
        let chatting = true;

        while (chatting) {
            const message = await ainput('');
            if (message === 'x') {
                chatting = false;
                this.actual_chat = '';
            } else {
                this.send_message({ mto: jid, mbody: message, mtype: 'chat' });
            }
        }
    }

    async start(event) {
        try {
            this.send_presence();
            await this.get_roster();
            this.is_connected = true;
            console.log('Logged in');
            asyncio.create_task(this.instancia_usuario());
        } catch (err) {
            this.is_connected = false;
            if (err.iq && err.iq.error && err.iq.error.text) {
                console.log(`Error: ${err.iq.error.text}`);
            } else {
                console.log('Error desconocido');
            }
            console.log('Error de Time out');
            this.disconnect();
        }
    }


    async instancia_usuario() {
        try {
            await this.add_neighbors();

            while (this.is_connected) {
                menus.user_menu();
                const opcion = await ainput('\n>> ');

                if (opcion === '1') {
                    await this.mostrar_status_contacto();
                } else if (opcion === '2') {
                    await this.anadir_contacto();
                } else if (opcion === '3') {
                    await this.eliminar_contacto();
                } else if (opcion === '4') {
                    await this.mostrar_detalles_vecinos(this.flooding);
                } else if (opcion === '5') {
                    await this.enviar_mensaje_contacto();
                } else if (opcion === '6') {
                    this.disconnect();
                    this.is_connected = false;
                } else if (opcion === '7') {
                    const mensaje = await ainput('Ingresa el mensaje: ');
                    const destino = await ainput('Ingresa el destino: ');
                    await this.enviar_mensaje_broadcast(`Fuente: ${this.flooding.node_name} Para: ${destino} dice: ${mensaje}`);
                } else {
                    console.log('\nOpción NO válida, ingrese de nuevo por favor.');
                }

                await asyncio.sleep(0.1);
            }
        } catch (e) {
            console.log('An error occurred:', e);
        }
    }
}

const { ClientXMPP, xml, Iq, JID } = require('slixmpp');

class BorrarCliente extends ClientXMPP {
    constructor(jid, password) {
        super({
            jid: jid,
            password: password
        });

        this.user = jid;
        this.on('session:started', this.start.bind(this));
    }

    async start() {
        try {
            this.sendPresence();
            await this.getRoster();

            const response = new Iq();
            response.type = 'set';
            response.from = this.boundjid.bare;

            const fragment = xml('<query xmlns="jabber:iq:register"><remove/></query>');
            response.append(fragment);

            await response.send();

            console.log(`Cuenta borrada correctamente: ${this.boundjid.jid}`);
        } catch (error) {
            if (error.name === 'IqError') {
                console.log(`Error al borrar la cuenta: ${error.toString()}`);
            } else if (error.name === 'IqTimeout') {
                console.log('Sin respuesta del servidor.');
            } else {
                console.log(`Error desconocido: ${error.toString()}`);
            }

            this.disconnect();
        }
    }
}

// Uso de la clase
const jid = 'tu_jid';
const password = 'tu_password';

const clienteBorrar = new BorrarCliente(jid, password);
clienteBorrar.start();
