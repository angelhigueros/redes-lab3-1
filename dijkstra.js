const readline = require('readline')

class WeightedDirectedGraph {
  constructor() {
    this.nodes = {}
  }

  addNode(node) {
    if (!this.nodes[node]) {
      this.nodes[node] = {}
    }
  }

  addEdge(node1, node2, weight) {
    this.addNode(node1)
    this.addNode(node2)
    this.nodes[node1][node2] = weight
  }

  getNeighbors(node) {
    return Object.keys(this.nodes[node])
  }

  getWeight(node1, node2) {
    return this.nodes[node1][node2]
  }

  send(path, type, from, to, payload) {
    for (let i = 0; i < path.length; i++) {
      let data = {
        type,
        headers: { from, to, hop_count: i },
        payload: payload,
      }
      const node = path[i]

      if (node === to) {
        console.log(payload)
      } else {
        console.log(data)
      }
    }
  }
}

// Create the tree auto
function generateRandomGraph(nodes, edges) {
  const graph = new WeightedDirectedGraph()

  for (let i = 0; i < nodes.length; i++) {
    graph.addNode(nodes[i])
  }

  for (let i = 0; i < edges; i++) {
    const node1 = nodes[Math.floor(Math.random() * nodes.length)]
    const node2 = nodes[Math.floor(Math.random() * nodes.length)]
    const weight = Math.floor(Math.random() * 10) + 1 // random weight between 1 and  10
    graph.addEdge(node1, node2, weight)
  }

  return graph
}

// Helpers
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const askQuestion = question => {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer)
    })
  })
}

const dijkstra = (graph, start, end) => {
  let distances = {}
  let previous = {}
  let unvisited = new Set()

  for (let node in graph.nodes) {
    distances[node] = node === start ? 0 : Infinity
    unvisited.add(node)
  }

  while (unvisited.size) {
    let closestNode = null
    for (let node of unvisited) {
      if (!closestNode || distances[node] < distances[closestNode]) {
        closestNode = node
      }
    }

    if (distances[closestNode] === Infinity) break
    if (closestNode === end) break

    for (let neighbor of graph.getNeighbors(closestNode)) {
      let newDistance =
        distances[closestNode] + graph.getWeight(closestNode, neighbor)

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance
        previous[neighbor] = closestNode
      }
    }

    unvisited.delete(closestNode)
  }

  let path = []
  let node = end

  while (node) {
    path.push(node)
    node = previous[node]
  }

  return path.reverse()
}

const main = async () => {
  console.log(':: LAB 3 - DIJKSTRA ::\n')

  // Create graph
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const numberOfEdges = 12
  const graph = generateRandomGraph(nodes, numberOfEdges)

  // Show graph
  console.log('Graph')
  console.log(graph.nodes)

  console.log('\nSEND MESSAGE')
  const from = await askQuestion('From: ')
  const to = await askQuestion('To: ')
  const message = await askQuestion('Message: ')
  rl.close()

  // Tabla de enrutamiento
  const shortestPath = dijkstra(graph, from, to)
  console.log(`Shortest path from ${from} to ${to}`, shortestPath)

  // Envío de “paquetes”
  graph.send(shortestPath, 'message', from, to, message)
}

main()
