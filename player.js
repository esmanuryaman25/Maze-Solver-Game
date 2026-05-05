(function () {
  "use strict";

  // Maps keyboard arrow keys to movement vectors.
  var DIRECTION_MAP = {
    ArrowUp: { dr: -1, dc: 0 },
    ArrowDown: { dr: 1, dc: 0 },
    ArrowLeft: { dr: 0, dc: -1 },
    ArrowRight: { dr: 0, dc: 1 },
  };

  // Checks if a row/col pair is inside the maze grid.
  function isInsideMaze(grid, row, col) {
    return row >= 0 && col >= 0 && row < grid.length && col < grid[0].length;
  }

  // Validates that a cell is a walkable path and not a wall.
  function isWalkableCell(grid, row, col) {
    if (!Array.isArray(grid) || grid.length === 0 || !Array.isArray(grid[0])) {
      return false;
    }

    return isInsideMaze(grid, row, col) && grid[row][col] === 0;
  }

  // Creates a new player object at the start cell.
  function createPlayer(start) {
    return {
      row: start.row,
      col: start.col,
      moves: 0,
    };
  }

  // Attempts to move the player in the requested arrow-key direction.
  function tryMovePlayer(player, grid, directionKey) {
    if (!player || !Array.isArray(grid) || grid.length === 0) {
      return { moved: false, reason: "invalid_state" };
    }

    var movement = DIRECTION_MAP[directionKey];
    if (!movement) {
      return { moved: false, reason: "invalid_direction" };
    }

    var nextRow = player.row + movement.dr;
    var nextCol = player.col + movement.dc;

    if (!isWalkableCell(grid, nextRow, nextCol)) {
      return { moved: false, reason: "blocked" };
    }

    player.row = nextRow;
    player.col = nextCol;
    player.moves += 1;

    return {
      moved: true,
      reason: "ok",
      position: { row: player.row, col: player.col },
      moves: player.moves,
    };
  }

  // Returns true when the player reaches the end cell.
  function hasPlayerReachedEnd(player, end) {
    if (!player || !end) {
      return false;
    }

    return player.row === end.row && player.col === end.col;
  }

  window.PlayerModule = {
    isWalkableCell: isWalkableCell,
    createPlayer: createPlayer,
    tryMovePlayer: tryMovePlayer,
    hasPlayerReachedEnd: hasPlayerReachedEnd,
  };
})();
