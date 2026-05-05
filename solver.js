(function () {
  "use strict";

  // Creates a unique string key for row/column pairs.
  function positionKey(row, col) {
    return row + "," + col;
  }

  // Returns valid non-wall neighbors for BFS traversal.
  function getValidNeighbors(grid, row, col) {
    var steps = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];
    var neighbors = [];

    for (var i = 0; i < steps.length; i += 1) {
      var nextRow = row + steps[i].dr;
      var nextCol = col + steps[i].dc;

      if (
        nextRow >= 0 &&
        nextCol >= 0 &&
        nextRow < grid.length &&
        nextCol < grid[0].length &&
        grid[nextRow][nextCol] === 0
      ) {
        neighbors.push({ row: nextRow, col: nextCol });
      }
    }

    return neighbors;
  }

  // Reconstructs the shortest path from the BFS parent mapping.
  function reconstructPath(parentMap, endKey) {
    var path = [];
    var cursor = endKey;

    while (cursor !== null && cursor !== undefined) {
      var parts = cursor.split(",");
      path.push({ row: Number(parts[0]), col: Number(parts[1]) });
      cursor = parentMap[cursor];
    }

    path.reverse();
    return path;
  }

  // Computes the shortest path with BFS and records visited order.
  function bfsShortestPath(grid, start, end) {
    if (!Array.isArray(grid) || grid.length === 0 || !start || !end) {
      return { path: [], visitedOrder: [] };
    }

    var startKey = positionKey(start.row, start.col);
    var endKey = positionKey(end.row, end.col);
    var queue = [{ row: start.row, col: start.col }];
    var visited = new Set([startKey]);
    var parentMap = {};
    var visitedOrder = [];

    parentMap[startKey] = null;

    while (queue.length > 0) {
      var current = queue.shift();
      var currentKey = positionKey(current.row, current.col);
      visitedOrder.push({ row: current.row, col: current.col });

      if (currentKey === endKey) {
        return {
          path: reconstructPath(parentMap, endKey),
          visitedOrder: visitedOrder,
        };
      }

      var neighbors = getValidNeighbors(grid, current.row, current.col);
      for (var i = 0; i < neighbors.length; i += 1) {
        var neighbor = neighbors[i];
        var neighborKey = positionKey(neighbor.row, neighbor.col);

        if (!visited.has(neighborKey)) {
          visited.add(neighborKey);
          parentMap[neighborKey] = currentKey;
          queue.push(neighbor);
        }
      }
    }

    return { path: [], visitedOrder: visitedOrder };
  }

  // Animates BFS exploration cells first, then shortest path cells.
  function animateBfsSolution(config) {
    var settings = config || {};
    var visitedOrder = Array.isArray(settings.visitedOrder) ? settings.visitedOrder : [];
    var path = Array.isArray(settings.path) ? settings.path : [];
    var visitedStepDelay = Number.isFinite(settings.visitedStepDelay)
      ? Math.max(0, settings.visitedStepDelay)
      : 16;
    var pathStepDelay = Number.isFinite(settings.pathStepDelay)
      ? Math.max(0, settings.pathStepDelay)
      : 75;
    var onVisit = typeof settings.onVisit === "function" ? settings.onVisit : function () {};
    var onPathStep = typeof settings.onPathStep === "function" ? settings.onPathStep : function () {};
    var onComplete = typeof settings.onComplete === "function" ? settings.onComplete : function () {};

    var visitIndex = 0;

    function animateVisited() {
      if (visitIndex >= visitedOrder.length) {
        animatePath();
        return;
      }

      onVisit(visitedOrder[visitIndex], visitIndex);
      visitIndex += 1;
      setTimeout(animateVisited, visitedStepDelay);
    }

    function animatePath() {
      var pathIndex = 0;

      function stepPath() {
        if (pathIndex >= path.length) {
          onComplete();
          return;
        }

        onPathStep(path[pathIndex], pathIndex);
        pathIndex += 1;
        setTimeout(stepPath, pathStepDelay);
      }

      stepPath();
    }

    animateVisited();
  }

  window.SolverModule = {
    positionKey: positionKey,
    bfsShortestPath: bfsShortestPath,
    animateBfsSolution: animateBfsSolution,
  };
})();
