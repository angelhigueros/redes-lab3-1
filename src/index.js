const { client, xml, jid } = require("@xmpp/client")
const fs = require('fs')
const path = require('path')
const net = require('net')
const debug = require("@xmpp/debug")
const readline = require('readline')
const WeightedDirectedGraph = require('./graph')


class Chat {
  constructor() {
    this.graph = null
    this.table = {}

    this.contacts = {}
    this.groupRoster = {}
    this.registerState = {successfulRegistration: false } 
    this.base64Data = ''

    this.namesConfigFile = "./ReferenceFiles/names-demo-1.txt"
    this.topoConfigFile = "./ReferenceFiles/topo-demo-1.txt"
    this.server = "alumchat.xyz"

    // Iconos para los shows de los Usuarios
    this.showIcon = {
      'away': '🟠Away',
      'xa': '🟡Extended away',
      'dnd': '⛔Do not disturb',
      'chat': '🟢Available',
      'unavailable': '⚪Offline',
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

  }


  // HELPERS
  findKeyByValue(obj, value) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === value) {
        return key;
      }
    }
    return null;
  }


  readFilesAndSaveToJson(namesFile, topoFile, callback) {
    fs.readFile(namesFile, 'utf8', (err, data1) => {
        if (err) {
            return callback(err);
        }
        fs.readFile(topoFile, 'utf8', (err, data2) => {
            if (err) {
                return callback(err);
            }

            try {
                const namesJson = JSON.parse(data1.replace(/'/g, '"'));
                const topoJson = JSON.parse(data2.replace(/'/g, '"'));

                const resultJson = {
                    names: namesJson,
                    topo: topoJson
                };

                callback(null, resultJson);
            } catch (parseError) {
                callback(parseError);
            }
        });
    });
  }


  // Crear arbol y tabla de enrutameinto
  crearTablaEnrutamiento(jid) {
    
        this.readFilesAndSaveToJson(this.namesConfigFile, this.topoConfigFile, (err, result) => {
          if (err) {
              console.error('[!] Error reading files:', err);
          } else {
    
            let names = result.names.config
            let topo = result.topo.config


            this.graph = new WeightedDirectedGraph()
    
    
            let clientKey = this.findKeyByValue(names, jid);

            // Crear arbol
            for (let key in topo) {
              if (topo.hasOwnProperty(key)) {
                this.graph.addNode(key)
    
                for (let i = 0; i < topo[key].length; i++) {
                  this.graph.addNode(topo[key][i])
    
                  const node1 = key
                  const node2 = topo[key][i]
    
                  const weight = Math.floor(Math.random() * 10) + 1
    
                  this.graph.addEdge(node1, node2, weight)
                  

                  // console.log("vamoo", {clientKey, node1})
                  if ( clientKey == node1) {
                    this.table[node2] = { jid: names[node2], weight }
                  }
                }
    
              }
            }

            if(JSON.stringify(this.table) === "{}") {
              console.log("[!] Su usuario debe estar incluido en la topologia indicada")
            }
          }
        })

  }



  // Menu principal para el usuario
  menu() { 
    console.log('1) Registrar una nueva cuenta en el servidor')
    console.log('2) Iniciar sesión con una cuenta')
    console.log('3) Eliminar la cuenta del servidor')
    console.log('4) Salir del programa')
    this.rl.question('\nElige una opción: ', (answer) => {
      this.handleMenuOption(answer)
    })
  }

// Funcion para cambiar el estado y show del usuario
  cambiarEstadoUsuario = (xmpp, show, status) => {
    try {
      const presenceStanza = xml(
        'presence',
        {},
        xml('show', {}, show), // estado como 'chat', 'away', 'dnd', etc.
        xml('status', {}, status) // mensaje opcional, por ejemplo, "En una reunión"
      )

      xmpp.send(presenceStanza)
      console.log(`💭 Estado cambiado a ${show} con status ${status}`)
    } catch (error) {
      console.error(`❌ Error al cambiar el estado y show del usuario: ${error.message}`)
    }
  }

  // Funcion para obtener el roster del usuario
  getRoster = (xmpp,jid) => {
    const rosterQuery = xml('iq', { type: 'get', to:`${jid}@${this.server}`}, xml('query', { xmlns: 'jabber:iq:roster' }))
    xmpp.send(rosterQuery)
  }

  // Funcion para limpiar el roster al cerrar sesion
  cleanContacts = () => {
    for (const contact in this.contacts) {
      delete this.contacts[contact]
    }
    for (const group in this.groupRoster) {
      delete this.groupRoster[group]
    }
    return Promise.resolve()
  }

  // Funcion para dar formato a los contactos al mostrarlos en el CLI
  formatContacts = async () => {
    if (this.contacts.length === 0) {
      console.log('No tienes contactos')
    }else{
      
      console.log('Contactos:') 
      console.log('\tJID    \t Show    \t Estado')
      for (const contact in this.contacts) {
        const isGroup = this.contact.includes(`@conference.${this.server}`)
        const contactJid = this.contact.split('@')[0]

        if (isGroup) {
          // Obtener el rouster del group y mostrarlo
          
          const grupRost = this.groupRoster[contact]
          console.log(`=> ${contactJid}: ${Object.keys(grupRost).length} miembros`)
          if (grupRost) {
            for (const contact in grupRost) {
              const contactJid = contact.split('@')[0]
              console.log(`\t--> ${contactJid}: ${grupRost[contact].show } \t(${grupRost[contact].status? grupRost[contact].status : 'sin estado'})`)
            }
          }
          continue
        }

        //print sin tanbulacion
        if (contactJid.length > 10) {
          console.log(`=> ${contactJid}: ${this.contacts[contact].show } \t(${this.contacts[contact].status? this.contacts[contact].status : 'sin estado'})`)
        }else if(contactJid.length < 7){
          console.log(`=> ${contactJid}:\t\t ${this.contacts[contact].show } \t(${this.contacts[contact].status? this.contacts[contact].status : 'sin estado'})`)
    
        }
        
        else{
          console.log(`=> ${contactJid}:\t ${this.contacts[contact].show } \t(${this.contacts[contact].status? this.contacts[contact].status : 'sin estado'})`)
    
        }
      }
    }
  }



  // Funcion para leer el archivo y enviarlo
  leerArchivo = async (xmpp,path,toJid) => {
    try{
    
      const extension = path.split('.').pop()
      
      const fileData = await fs.readFileSync(path)
      const encodedFileData = Buffer.from(fileData).toString('base64')
      const message = `file://${extension}://${encodedFileData}` // se crea el mensaje
      
      this.sendMessages(xmpp, toJid, message)
      return
    }
    catch(err){
      console.log('❌ El archivo adjuntado no existe')
      return
    }
  }

  // Funcion para manejar las opciones del menu principal de acciones
  handleMenuOption(option) {
    switch (option) {
      case '1':
        this.rl.question('Introduce el nuevo ID para la cuenta: ', (jid) => {
          this.rl.question('Introduce la contraseña para la cuenta: ', (password) => {
            this.register(jid, password)
          })
        })
        break
      case '2':
        
        this.rl.question('Introduce el ID para la cuenta: ', (jid) => {
          this.rl.question('Introduce la contraseña para la cuenta: ', (password) => {

            this.login(jid, password)

          })
        })
        break
        
      case '3':
        this.rl.question('Introduce el ID para la cuenta: ', (jid) => {
          this.rl.question('Introduce la contraseña para la cuenta: ', (password) => {
            this.deleteAccount(jid, password)
          })
        })
        break
      case '4':
        console.log('Saliendo del programa...')
        this.rl.close()
        process.exit(0)

      default:
        console.log('Opción no válida. Por favor, elige una opción válida.')
        this.menu()
    }
  }

  // Funcion para registrar una nueva cuenta
  async register(username, password) {
    
    this.crearTablaEnrutamiento(`${username}@${server}`)

    // Se usa un socket de net para registrar la cuenta
    const client = new net.Socket()
    client.connect(5222, server, function() {
      console.log('Connected')
      client.write('<stream:stream to="' + this.server + '" xmlns="jabber:client" xmlns:stream="http://etherx.jabber.org/streams" version="1.0">')
    })

    // Se verifica el usuario y se envia el registro
    client.on('data', function(data) {
      // console.log('Received: ' + data)
      if (data.toString().includes('<stream:features>')) {
        client.write('<iq type="set" id="reg1"><query xmlns="jabber:iq:register"><username>' + username + '</username><password>' + password + '</password></query></iq>')
      } else if (data.toString().includes('iq type="result" id="reg1"')) {
        // El registro fue exitoso, procede con el inicio de sesión
        this.registerState.successfulRegistration = true
        client.destroy()
      } else if (data.toString().includes('<error code"409" type="cancel"><conflict xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>')) {
        // El usuario ya existe
        console.log('❌ El usuario ya existe, por favor elige un nombre de usuario diferente.')
        client.destroy()
      }
    })

    // Se cierra la conexion e inicia sesion si el registro fue exitoso
    client.on('close', function() {
      console.log('Connection closed')
      if (this.registerState.successfulRegistration) {
        console.log('Registro exitoso, iniciando sesión...\n\n')
        this.login(username, password)
      }
      else {
        // Si el registro no fue existoso, mostramos el menu de usuario
        this.menu()
      }
    })
  }

  // Funcion para crear una sala de chat
  crearRoom = async (xmpp, roomName) => {
    try {
      // Crear sala de chat
      const groupJid = `${roomName}@conference.${this.server}/${xmpp.jid.local}`
      const groupStanza = xml('presence', { to: groupJid }, xml('x', { xmlns: 'http://jabber.org/protocol/muc' }))
      xmpp.send(groupStanza)

      // Configurar sala de chat como abierta
      const configRequest = xml('iq', { to: groupJid, type: 'set' }, 
        xml('query', { xmlns: 'http://jabber.org/protocol/muc#owner' }, 
          xml('x', { xmlns: 'jabber:x:data', type: 'submit' }, 
            xml('field', { var: 'muc#roomconfig_publicroom', type: 'boolean' }, 
              xml('value', {}, '1')
            )
          )
        )
      )

      xmpp.send(configRequest)
      console.log("👯 Sala de chat creada exitosamente y configurada como abierta")
    } catch (error) {
      console.log(`❌ Error al crear la sala de chat: ${error.message}`)
    }
  }

  // Funcion para unirse a una sala de chat
  unirseRoom = async (xmpp, roomName) => {
    try {
      const groupJid = `${roomName}@conference.${this.server}/${xmpp.jid.local}`
      const groupStanza = xml('presence', { to: groupJid }, xml('x', { xmlns: 'http://jabber.org/protocol/muc' }))
      xmpp.send(groupStanza)
      console.log(`👯 Intentando unirse al grupo público ${roomName}`)
    } catch (error) {
      console.log(`❌ Error al unirse a la sala de chat: ${error.message}`)
    }
  }

  // Funcion para agregar un contacto con una stanza de presence
  addContact = async (xmpp, contactJid) => {
    try {
      const presenceStanza =  xml('presence', { to: `${contactJid}@${this.server}`, type: 'subscribe' })
      await xmpp.send(presenceStanza)
      console.log('📨 Solicitud de contacto enviada a', contactJid)
    } catch (error) {
      console.log('❌ Error al agregar contacto', error)
    }
  }

  // Funcion para enviar mensajes
  sendMessages = async (xmpp, contactJid, message) => {
    try {
      const messageStanza = xml(
        'message',
        { type: 'chat', to: contactJid + '@' + this.server },
        xml('body', {}, message),
      )
      xmpp.send(messageStanza)
    } catch (error) {
      console.log('❌ Error al enviar mensaje', error)
    }
  }

  // Funcion para mostrar el segundo menu de funciones
  secondMenu = ()=> {

    console.log("\n Graph info  \n")
    console.log("1. graph", this.graph) 
    console.log("2. table", this.table)

    console.log('\n')
    console.log('1) Mostrar todos los contactos y su estado')
    console.log('2) Agregar un usuario a los contactos')
    console.log('3) Mostrar detalles de contacto de un usuario')
    console.log('4) Comunicación 1 a 1 con cualquier usuario/contacto')
    console.log('5) Participar en conversaciones grupales')
    console.log('6) Cambiar estado y show')
    console.log('7) Enviar/recibir archivos')
    console.log('8) Cerrar sesion')
    this.rl.question('\nElige una opción: ',async (answer) => {
      await handleSecondMenuOption(answer)
    })
  }


  // Funcion para mostrar el menu de funciones de grupo
  handleGroup = (option) => { 
    switch (option) {
      case '1':
        // Crear grupo
        this.rl.question('Introduce el nombre del grupo: ', (groupName) => {
          crearRoom(xmpp,groupName)
          this.secondMenu()
        })
        break
      case '2':
        // Enviar mensaje a grupo
        this.rl.question('Introduce el nombre del grupo: ', (groupName) => {
          this.rl.question('Introduce el mensaje que deseas enviar: ', (message) => {
            const groupJid = `${groupName}@conference.${this.server}`
            const messageStanza = xml('message', { to: groupJid, type: 'groupchat' }, xml('body', {}, message))
            xmpp.send(messageStanza)
            this.secondMenu()
          })
        })
        break
      case '3':
        // Agregar usuario a grupo
        this.rl.question('Introduce el nombre del grupo: ', (groupName) => {
          this.rl.question('Introduce el JID del usuario que deseas agregar: ', (contactJid) => {
            const groupJid = `${groupName}@conference.${this.server}`
            const inviteStanza = xml('message', { to: groupJid },
              xml('x', { xmlns: 'http://jabber.org/protocol/muc#user' },
                xml('invite', { to: `${contactJid}@${this.server}` })
              )
            )
            xmpp.send(inviteStanza)
            console.log(`Invitación enviada a ${contactJid} para unirse al grupo ${groupName}`)
            this.secondMenu()
          })
        })
        break
      case '4':
        // Unirse a un grupo público
        this.rl.question('Introduce el nombre del grupo público al que deseas unirte: ', (groupName) => {
          this.unirseRoom(xmpp,groupName)
          this.secondMenu()
        })
        break
        
      
      default:
        console.log('❌ Opción no válida. Por favor, elige una opción válida.')
        this.secondMenu()
    }
  }

  async login(jid, password) {

    this.crearTablaEnrutamiento(`${jid}@${this.server}`)

    // Nos conectamos al servidor
    const xmpp = client({
      service: `xmpp://${this.server}:5222`,
      domain: this.server,
      username: jid, 
      password: password,
      // terminal: true,
    })

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
   
    
    // Funcion para manejar las opciones del menu de funciones
    const handleSecondMenuOption = async(option) => {
      switch (option) {
        case '1':
          //Mostar todos los contactos y su estado
          this.formatContacts()
          this.secondMenu()
          break
        case '2':
          // Agregar un usuario a los contactos
          this.rl.question('Introduce el ID del usuario que deseas agregar: ',async (contactJid) => {
            this.addContact(xmpp, contactJid)
            this.secondMenu()
          })
          break
        case '3':
          // Mostrar detalles de contacto de un usuario
          this.rl.question('Introduce el JID del usuario del que deseas ver detalles: ', (contactJid) => {
            const contact = contacts[contactJid + '@' + this.server]
            if (contact) {
              console.log(`Detalles de ${contactJid}: ${contact.show || 'disponible'} (${contact.status || 'sin estado'})`)
            } else {
              console.log('No se encontró el usuario o no está en tu lista de contactos.')
            }
            this.secondMenu()
          })
          break
        case '4':
          // Comunicación 1 a 1 con cualquier usuario/contacto
          this.rl.question('Introduce el JID del usuario con el que deseas chatear: ', (contactJid) => {
            this.rl.question('Introduce el mensaje que deseas enviar: ', (message) => {
              this.sendMessages(xmpp, contactJid, message)
              this.secondMenu()
            })
          })
          break
        case '5':
          // Participar en conversaciones grupales
          console.log('1) Crear grupo')
          console.log('2) Enviar mensaje a grupo')
          console.log('3) Agregar usuario a grupo')
          console.log('4) Unirse a un grupo público') // Nueva opción aquí
          this.rl.question('\nElige una opción: ', (answer) => {
            this.handleGroup(answer)
          })
          break
          
        case '6':
          // Cambiar estado y show
          for (const show in this.showIcon) {
            console.log(`${show}: ${this.showIcon[show]}`)
          }
          this.rl.question('Introduce el show que deseas usar: ', (show) => {
            this.rl.question('Introduce el mensaje de estado que deseas usar (opcional): ', (status) => {
              this.cambiarEstadoUsuario(xmpp, show, status)
              this.secondMenu()
            })
          })
          break
        case '7':
          // Enviar/recibir archivos
          this.rl.question('Introduce el JID del usuario al que deseas enviar un archivo: ', (contactJid) => {
            this.rl.question('Introduce la ruta del archivo que deseas enviar: ', async (filePath) => {
              await this.leerArchivo(xmpp,filePath,contactJid)
              this.secondMenu()
            })
          })
          break
        case '8':
          // Cerrar sesion
          const end = await xmpp.send(xml('presence', {type: 'unavailable'}))
          // const dobleend = cambiarEstadoUsuario(xmpp, 'unavailable', '')
          const clean = await this.cleanContacts()
          Promise.all([end,clean])
          await xmpp.stop()
          
          break
        default:
          console.log('❌ Opción no válida. Por favor, elige una opción válida.')
          this.secondMenu()
      }
    }

    xmpp.on('stanza', async (stanza) => {
      if (stanza.is('message')) {
        
        // Manejar invitaciones a salas de grupo
        if (stanza.is('message') && stanza.getChild('x', 'http://jabber.org/protocol/muc#user') 
            && stanza.getChild('x', 'http://jabber.org/protocol/muc#user').getChild('invite')) 
        {
          const roomJid = stanza.attrs.from
          console.log(`💌 Has sido invitado a la sala ${roomJid}`)
        
          const presenceStanza = xml(
            'presence',
            { to: roomJid + '/' + xmpp.jid.local },
            xml('x', { xmlns: 'http://jabber.org/protocol/muc' })
          )
          xmpp.send(presenceStanza)
          console.log(`👯 Te has unido a la sala ${roomJid}`)
        }
        // Manejar mensajes 1 a 1
        else if (stanza.is('message') && stanza.attrs.type === 'chat' && stanza.getChild('body')) {
          const from = stanza.attrs.from
          const message = stanza.getChildText('body')

          // Verificar si es un archivo
          const isFile = message.includes('file://') 
          if (isFile) {
            const fileData = message.split('//')[2]
            const extension = message.split('//')[1].split(':')[0]
            const decodedFileData = Buffer.from(fileData, 'base64')
            const fileName = `${from.split('@')[0]}-${Date.now()}.${extension}`
            const directoryPath = path.join(__dirname, './recibidos');

            // Crear el directorio si no existe
            if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
            }

            //guardarlo en ./recibidos
            fs.writeFileSync(path.join(__dirname,`./recibidos/${fileName}`), decodedFileData)
            console.log(`📃 Nuevo archivo de ${from}: ${fileName}`)
          }else{

            console.log(`📥 Nuevo mensaje de ${from}: ${message}`)
          }
        } 
        // Manejar mensajes de grupo
        else if (stanza.is('message') && stanza.attrs.type === 'groupchat') {
          const from = stanza.attrs.from
          const roomJid = from.split('/')[0]  // Obtiene el JID de la sala sin el recurso (nombre del usuario)
          const senderNickname = from.split('/')[1]  // Obtiene el nickname del usuario que envió el mensaje
          const body = stanza.getChildText('body')
          
          if (body) {  // Verifica si realmente hay un cuerpo en el mensaje
              console.log(`👯 Mensaje de ${senderNickname} en sala ${roomJid}:📥 ${body}`)
          }
      }
      }
      // Manejo del loggin
      else if (stanza.is('presence') && stanza.attrs.from === xmpp.jid.toString() && stanza.attrs.type !== 'unavailable') {
        // Obtener el roster del usuario
        this.getRoster(xmpp,jid)
        console.log('🗸', 'Successfully logged in')
        this.secondMenu()
      }
      // Manejo de la suscripcion
      else if (stanza.is('presence')){
        // Si es una presencia de un usuario agregar al roster
        if (stanza.attrs.type === 'subscribe'){
          console.log(`🤗 Solicitud de suscripcion de ${stanza.attrs.from}`)
          xmpp.send(xml('presence', { to: stanza.attrs.from, type: 'subscribed' }))
          console.log(`🤗 Has aceptado la solicitud de ${stanza.attrs.from}`)
          this.contacts[stanza.attrs.from] = {status: '', show: '🟢Available'}
        }
        // Si es una presencia de un usuario aceptando la suscripcion
        else if (stanza.attrs.type === 'subscribed'){
          console.log(`🤗 El usuario ${stanza.attrs.from} ha aceptado tu solicitud de suscripcion`)
        }
        else if(!stanza.attrs.type){
          const contactJid = stanza.attrs.from.split('/')[0]
          if (contactJid !== xmpp.jid.bare().toString()) {  // Comprueba si el JID del contacto es diferente al tuyo
            console.log(`El usuario ${contactJid} ha cambiado su estado`)
            const status = stanza.getChild('status')?.getText()
            const show = stanza.getChild('show')?.getText()
            if (status) {
              this.contacts[contactJid] = {...this.contacts[contactJid],status}
            }else{
              this.contacts[contactJid] = {...this.contacts[contactJid],status: ''}
            }
            if (show) {
              this.contacts[contactJid] = {...this.contacts[contactJid],show: showIcon[show]}
            }else{
              this.contacts[contactJid] = {...this.contacts[contactJid],show: '🟢Available'}
            }
            //contacts[contactJid] = {status, show}
          }
        }
        else if (stanza.attrs.type === 'unavailable'){
          const contactJid = stanza.attrs.from.split('/')[0]
          if (contactJid !== xmpp.jid.bare().toString()) {  // Comprueba si el JID del contacto es diferente al tuyo
            console.log(`El usuario ${contactJid} se ha desconectado`)
            const status = 'unavailable'
            const show = '⚪Offline'
            this.contacts[contactJid] = {status, show}
          }
        }

        // Si es una presencia de un grupo agregar al roster del grupo
        if (stanza.getChild('x', 'http://jabber.org/protocol/muc#user')) {
          const local = {}
          const groupJid = stanza.attrs.from.split('/')[0]
          const groupRosterItems = stanza.getChild('x').getChildren('item')
          
          groupRosterItems.forEach((item) => {
            const contactJid = item.attrs.jid.split('/')[0]
            const status = ""
            const show = "🟢Available"
            console.log(`${contactJid} se ha unido al grupo ${groupJid}`)
            if (contactJid !== xmpp.jid.bare().toString() && !(contactJid in this.contacts)) { 
              this.contacts[contactJid] = {status, show}
            }
            if (!(contactJid in local)){

              local[contactJid] = {status, show}
            }
          })

          if (!(groupJid in this.groupRoster)){
            this.groupRoster[groupJid] = local
          }else{
            this.groupRoster[groupJid] = {...this.groupRoster[groupJid],...local}
          }
          
        }
      }

      // Para guardar el rouster
      else if (stanza.is('iq') && stanza.attrs.type === 'result' && stanza.getChild('query', 'jabber:iq:roster')) {
        const rosterItems = stanza.getChild('query').getChildren('item')
        rosterItems.forEach((item) => {
          const contactJid = item.attrs.jid
          const status = ""
          const show = "⚪Offline"
          if (contactJid !== xmpp.jid.bare().toString() && !(contactJid in this.contacts)) { 
            this.contacts[contactJid] = {status, show}
          }
        })
      }
    
    


    })

    // Manejo de eventos
    xmpp.on('online', async (address) => {
      console.log('▶', 'online as', address.toString())
      await xmpp.send(xml('presence'))
    })

    // Si el servidor nos envia un error
    xmpp.on('error',async (err) => {

      if (err.condition === 'not-authorized') {
        console.error('❌ Autenticación fallida. Verifica tu ID de cuenta y contraseña.')
      } else {
        console.error('❌', err.toString())
      }
      this.menu()
    })

    // Si nos desconectamos
    xmpp.on('offline', () => {
      console.log('⏹', 'offline')
      this.menu()
    })

    // Nos conectamos al servidor
    xmpp.start().catch(() =>{})

  }

  // Funcion para eliminar una cuenta del servidor
  async deleteAccount(jid, password) {

    // Nos conectamos al servidor 
    const xmpp = client({
      service: `xmpp://${this.server}:5222`,
      domain: this.server,
      username: jid, 
      password: password,
      terminal: true,
    })

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    
    xmpp.on('stanza', async (stanza) => {
      // si nos llega la estanza del result es que se ha eliminado la cuenta
      if (stanza.is('iq') && stanza.attrs.type === 'result') {
        console.log('🗸', 'Successfully deleted account')
        
      }
    })

    xmpp.on('error', (err) => {
      // console.error('❌', err.toString())
      if (err.condition === 'not-authorized') {
        console.error('❌ Autenticación fallida. Verifica tu ID de cuenta y contraseña.')
      }
      this.menu()
    })

    xmpp.on('online', async () => {
      console.log('▶', 'online as', xmpp.jid.toString(), '\n')
      // creamos la estanza para eliminar la cuenta
      const deleteStanza = xml(
        'iq',
        { type: 'set', id: 'delete1' },
        xml('query', { xmlns: 'jabber:iq:register' }, xml('remove'))
      )
      try{

        await xmpp.send(deleteStanza)
      }
      catch(err){
        console.log(err)
      }finally{
        
        await xmpp.stop()
      }
    })
    // Nos desconectamos y volvemos al menu 
    xmpp.on('offline', () => {
      xmpp.stop()
      console.log('⏹', 'Desconectandote del Servidor...')

      this.menu()


    })

    xmpp.start().catch(() => {})
  }



}





const chat = new Chat()
chat.menu()
