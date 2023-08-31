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
}

// Create the tree manually -  example
// graph.addEdge("A", "B", 4);
// graph.addEdge("A", "C", 2);
// graph.addEdge("B", "E", 3);
// graph.addEdge("C", "D", 2);
// graph.addEdge("D", "E", 3);


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

module.exports = { generateRandomGraph }
