(function () {
  "use strict";

  // Sample fixed maze for Easy difficulty.
  const EASY_MAZE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  // Supported difficulties and their grid sizes.
  const DIFFICULTY_SIZES = Object.freeze({
    easy: 11,
    medium: 15,
    hard: 21,
  });

  // Creates a deep copy of a 2D maze array.
  function cloneMaze(maze) {
    return maze.map(function (row) {
      return row.slice();
    });
  }

  // Creates a square 2D grid filled with the provided value.
  function createFilledGrid(size, fillValue) {
    return Array.from({ length: size }, function () {
      return Array(size).fill(fillValue);
    });
  }

  // Checks whether a position is inside the maze boundaries.
  function isInsideGrid(size, row, col) {
    return row >= 0 && col >= 0 && row < size && col < size;
  }

  // Returns a shuffled copy of an array using Fisher-Yates.
  function shuffleArray(items) {
    var copy = items.slice();

    for (var i = copy.length - 1; i > 0; i -= 1) {
      var randomIndex = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[randomIndex];
      copy[randomIndex] = temp;
    }

    return copy;
  }

  // Converts any input difficulty into a valid difficulty key.
  function normalizeDifficulty(difficulty) {
    if (typeof difficulty !== "string") {
      return "easy";
    }

    var lowered = difficulty.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(DIFFICULTY_SIZES, lowered)) {
      return lowered;
    }

    return "easy";
  }

  // Generates a solvable maze with Recursive Backtracking.
  function generateRecursiveBacktrackingMaze(size) {
    var safeSize = Number(size);

    if (!Number.isInteger(safeSize) || safeSize < 5 || safeSize % 2 === 0) {
      throw new Error("Maze size must be an odd integer greater than or equal to 5.");
    }

    var grid = createFilledGrid(safeSize, 1);
    var stack = [{ row: 1, col: 1 }];
    var directions = [
      { dr: -2, dc: 0 },
      { dr: 2, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 },
    ];

    grid[1][1] = 0;

    while (stack.length > 0) {
      var current = stack[stack.length - 1];
      var shuffledDirections = shuffleArray(directions);
      var carved = false;

      for (var i = 0; i < shuffledDirections.length; i += 1) {
        var nextRow = current.row + shuffledDirections[i].dr;
        var nextCol = current.col + shuffledDirections[i].dc;

        if (isInsideGrid(safeSize, nextRow, nextCol) && grid[nextRow][nextCol] === 1) {
          var wallRow = current.row + shuffledDirections[i].dr / 2;
          var wallCol = current.col + shuffledDirections[i].dc / 2;

          grid[wallRow][wallCol] = 0;
          grid[nextRow][nextCol] = 0;
          stack.push({ row: nextRow, col: nextCol });
          carved = true;
          break;
        }
      }

      if (!carved) {
        stack.pop();
      }
    }

    var endRow = safeSize - 2;
    var endCol = safeSize - 2;
    grid[endRow][endCol] = 0;

    if (grid[endRow][endCol - 1] === 1 && grid[endRow - 1][endCol] === 1) {
      grid[endRow][endCol - 1] = 0;
    }

    return grid;
  }

  // Creates a complete maze state object based on selected difficulty.
  function createMazeState(difficulty, options) {
    var normalizedDifficulty = normalizeDifficulty(difficulty);
    var settings = options || {};
    var useFixedEasy = Boolean(settings.useFixedEasy);
    var size = DIFFICULTY_SIZES[normalizedDifficulty];
    var grid;

    if (normalizedDifficulty === "easy" && useFixedEasy) {
      grid = cloneMaze(EASY_MAZE);
    } else {
      grid = generateRecursiveBacktrackingMaze(size);
    }

    return {
      difficulty: normalizedDifficulty,
      grid: grid,
      start: { row: 1, col: 1 },
      end: { row: size - 2, col: size - 2 },
    };
  }

  window.MazeModule = {
    EASY_MAZE: EASY_MAZE,
    DIFFICULTY_SIZES: DIFFICULTY_SIZES,
    cloneMaze: cloneMaze,
    normalizeDifficulty: normalizeDifficulty,
    generateRecursiveBacktrackingMaze: generateRecursiveBacktrackingMaze,
    createMazeState: createMazeState,
  };
})();
