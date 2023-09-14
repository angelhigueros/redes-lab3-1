const linkStateRouting = (startNode) => {
    let distances = {};
    let previousNodes = {};
    
    let unvisitedNodes = new Set(Object.keys(this.nodes));

    for(let node in this.nodes) {
      distances[node] = Infinity;
      previousNodes[node] = null;
    }
    distances[startNode] = 0;

    while(unvisitedNodes.size > 0) {
      let currentNode = this._getClosestNode(distances, unvisitedNodes);
      unvisitedNodes.delete(currentNode);

      for(let neighbor of this.getNeighbors(currentNode)) {
        let tentativeDistance = distances[currentNode] + this.getWeight(currentNode, neighbor);
        if(tentativeDistance < distances[neighbor]) {
          distances[neighbor] = tentativeDistance;
          previousNodes[neighbor] = currentNode;
        }
      }
    }

    return { distances, previousNodes };
}


module.exports = linkStateRouting