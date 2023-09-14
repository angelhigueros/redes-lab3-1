class DistanceVectorRouting {
    constructor(graph) {
      this.graph = graph;
      this.nodes = Object.keys(graph);
      this.table = {};
  
      this.nodes.forEach(node => {
        this.table[node] = {};
        this.nodes.forEach(target => {
          if (node === target) {
            this.table[node][target] = 0;
          } else {
            this.table[node][target] = Infinity;
          }
        });
      });
  
      this.nodes.forEach(node => {
        for (let target in this.graph[node]) {
          this.table[node][target] = this.graph[node][target];
        }
      });
    }
  
    update() {
      let change = false;
  
      this.nodes.forEach(node => {
        this.nodes.forEach(neighbour => {
          this.nodes.forEach(target => {
            if (
              this.table[node][target] >
              this.table[node][neighbour] + this.table[neighbour][target]
            ) {
              this.table[node][target] =
                this.table[node][neighbour] + this.table[neighbour][target];
              change = true;
            }
          });
        });
      });
  
      return change;
    }
  
    findShortestPaths() {
      while (this.update()) {}
    }
  
    printTable() {
      console.log(this.table);
    }
  }
  
  // Ejemplo de uso
  const graph = {
    A: { B: 1, C: 4 },
    B: { C: 2, D: 5 },
    C: { D: 3 },
    D: {}
  };
  
  const dvr = new DistanceVectorRouting(graph);
  dvr.findShortestPaths();
  dvr.printTable();
  