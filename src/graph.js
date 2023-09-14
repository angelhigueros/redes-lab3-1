class WeightedDirectedGraph {
  constructor() {
    this.nodes = {};
  }

  addNode(node) {
    if (!this.nodes[node]) {
      this.nodes[node] = {};
    }
  }

  addEdge(node1, node2, weight) {
    this.addNode(node1);
    this.addNode(node2);
    this.nodes[node1][node2] = weight;
  }

  getNeighbors(node) {
    return Object.keys(this.nodes[node]);
  }

  getWeight(node1, node2) {
    return this.nodes[node1][node2];
  }

  send(path, type, from, to, payload) {
    for (let i = 0; i < path.length; i++) {
      let data = {
        type,
        headers: { from, to, hop_count: i },
        payload: payload,
      };
      const node = path[i];

      if (node === to) {
        console.log(payload);
      } else {
        console.log(data);
      }
    }
  }

  distanceVector(startNode) {
    const distances = {};
    const predecessors = {};

    // Inicialización de todas las distancias como infinito y los predecesores como nulos
    for (let node in this.nodes) {
      distances[node] = Infinity;
      predecessors[node] = null;
    }

    distances[startNode] = 0; // La distancia al nodo inicial es 0

    // Relajar las aristas
    for (let i = 0; i < Object.keys(this.nodes).length - 1; i++) {
      for (let node1 in this.nodes) {
        for (let node2 in this.nodes[node1]) {
          let weight = this.getWeight(node1, node2);
          if (distances[node1] + weight < distances[node2]) {
            distances[node2] = distances[node1] + weight;
            predecessors[node2] = node1;
          }
        }
      }
    }

    // Verificar ciclos negativos
    for (let node1 in this.nodes) {
      for (let node2 in this.nodes[node1]) {
        let weight = this.getWeight(node1, node2);
        if (distances[node1] + weight < distances[node2]) {
          console.log("Graph contains a negative-weight cycle!");
          return;
        }
      }
    }

    return distances;
  }
}

module.exports = WeightedDirectedGraph;
