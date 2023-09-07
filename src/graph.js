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
  

module.exports = WeightedDirectedGraph