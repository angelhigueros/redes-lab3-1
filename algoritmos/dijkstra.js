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