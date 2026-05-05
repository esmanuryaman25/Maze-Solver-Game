(function () {
  "use strict";

  var state = {
    difficulty: "easy",
    maze: [],
    initialMaze: [],
    start: { row: 1, col: 1 },
    end: { row: 1, col: 1 },
    player: null,
    elapsedSeconds: 0,
    timerIntervalId: null,
    isGameWon: false,
    isSolving: false,
    solveSessionToken: 0,
    visitedCells: new Set(),
    solutionCells: new Set(),
  };

  var dom = {
    maze: document.getElementById("maze"),
    moveCounter: document.getElementById("moveCounter"),
    timer: document.getElementById("timer"),
    restartBtn: document.getElementById("restartBtn"),
    solveBtn: document.getElementById("solveBtn"),
    newMazeBtn: document.getElementById("newMazeBtn"),
    difficultySelect: document.getElementById("difficultySelect"),
    winOverlay: document.getElementById("winOverlay"),
    winStats: document.getElementById("winStats"),
    overlayRestartBtn: document.getElementById("overlayRestartBtn"),
  };

  // Creates a stable string key for a maze cell.
  function keyForCell(row, col) {
    return row + "," + col;
  }

  // Formats elapsed seconds into MM:SS format.
  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    var seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return minutes + ":" + seconds;
  }

  // Clears existing timer interval to prevent duplicates.
  function clearTimer() {
    if (state.timerIntervalId !== null) {
      clearInterval(state.timerIntervalId);
      state.timerIntervalId = null;
    }
  }

  // Starts and updates the in-game timer every second.
  function startTimer() {
    clearTimer();
    state.timerIntervalId = setInterval(function () {
      if (!state.isGameWon) {
        state.elapsedSeconds += 1;
        updateHud();
      }
    }, 1000);
  }

  // Resets timer values and immediately updates the HUD.
  function resetTimer() {
    clearTimer();
    state.elapsedSeconds = 0;
    updateHud();
  }

  // Updates move counter and timer text in the UI.
  function updateHud() {
    if (dom.moveCounter) {
      dom.moveCounter.textContent = state.player ? String(state.player.moves) : "0";
    }

    if (dom.timer) {
      dom.timer.textContent = formatTime(state.elapsedSeconds);
    }
  }

  // Calculates a responsive maze cell size based on viewport and grid dimensions.
  function calculateCellSize() {
    if (!Array.isArray(state.maze) || state.maze.length === 0) {
      return 28;
    }

    var boardLimit = Math.min(window.innerWidth * 0.78, window.innerHeight * 0.7, 560);
    var size = Math.floor(boardLimit / state.maze.length);
    return Math.max(15, Math.min(42, size));
  }

  // Clears visualization sets used by BFS animation.
  function clearSolveVisuals() {
    state.visitedCells.clear();
    state.solutionCells.clear();
  }

  // Hides the full-screen win overlay.
  function hideWinOverlay() {
    if (dom.winOverlay) {
      dom.winOverlay.classList.add("hidden");
    }
  }

  // Shows the full-screen win overlay with final stats.
  function showWinOverlay() {
    if (!dom.winOverlay || !dom.winStats || !state.player) {
      return;
    }

    dom.winStats.textContent = "Moves: " + state.player.moves + " | Time: " + formatTime(state.elapsedSeconds);
    dom.winOverlay.classList.remove("hidden");
  }

  // Builds a single maze cell element with all dynamic classes.
  function createCellElement(row, col, value) {
    var cell = document.createElement("div");
    var key = keyForCell(row, col);

    cell.classList.add("maze-cell");
    cell.classList.add(value === 1 ? "wall" : "path");

    if (row === state.start.row && col === state.start.col) {
      cell.classList.add("start");
    }

    if (row === state.end.row && col === state.end.col) {
      cell.classList.add("end");
    }

    if (state.visitedCells.has(key) && !(row === state.start.row && col === state.start.col)) {
      cell.classList.add("visited");
    }

    if (state.solutionCells.has(key) && !(row === state.start.row && col === state.start.col)) {
      cell.classList.add("solution");
    }

    if (state.player && row === state.player.row && col === state.player.col) {
      cell.classList.add("player");
    }

    return cell;
  }

  // Renders the entire maze grid and all visual states.
  function renderMaze() {
    if (!dom.maze || !Array.isArray(state.maze) || state.maze.length === 0) {
      return;
    }

    dom.maze.innerHTML = "";
    dom.maze.style.setProperty("--grid-size", String(state.maze.length));
    dom.maze.style.setProperty("--cell-size", calculateCellSize() + "px");

    for (var row = 0; row < state.maze.length; row += 1) {
      for (var col = 0; col < state.maze[row].length; col += 1) {
        dom.maze.appendChild(createCellElement(row, col, state.maze[row][col]));
      }
    }
  }

  // Marks the game as won and stops active interactions.
  function finalizeWinState() {
    if (state.isGameWon) {
      return;
    }

    state.isGameWon = true;
    clearTimer();
    updateHud();
    showWinOverlay();
  }

  // Loads a new maze for a difficulty and resets the full game state.
  function loadMazeByDifficulty(difficulty, useFixedEasy) {
    try {
      var mazeState = window.MazeModule.createMazeState(difficulty, {
        useFixedEasy: Boolean(useFixedEasy),
      });

      state.difficulty = mazeState.difficulty;
      state.maze = window.MazeModule.cloneMaze(mazeState.grid);
      state.initialMaze = window.MazeModule.cloneMaze(mazeState.grid);
      state.start = { row: mazeState.start.row, col: mazeState.start.col };
      state.end = { row: mazeState.end.row, col: mazeState.end.col };
      state.player = window.PlayerModule.createPlayer(state.start);
      state.isGameWon = false;
      state.isSolving = false;
      state.solveSessionToken += 1;

      clearSolveVisuals();
      hideWinOverlay();
      resetTimer();
      startTimer();
      updateHud();
      renderMaze();
    } catch (error) {
      console.error("Failed to load maze:", error);
      alert("Unable to create maze. Please try again.");
    }
  }

  // Resets the current maze to its initial state without changing difficulty.
  function restartCurrentMaze() {
    if (!Array.isArray(state.initialMaze) || state.initialMaze.length === 0) {
      return;
    }

    state.maze = window.MazeModule.cloneMaze(state.initialMaze);
    state.player = window.PlayerModule.createPlayer(state.start);
    state.isGameWon = false;
    state.isSolving = false;
    state.solveSessionToken += 1;

    clearSolveVisuals();
    hideWinOverlay();
    resetTimer();
    startTimer();
    updateHud();
    renderMaze();
  }

  // Handles keyboard movement when arrow keys are pressed.
  function handleKeyMovement(event) {
    var key = event.key;
    if (key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight") {
      return;
    }

    event.preventDefault();

    if (state.isGameWon || state.isSolving || !state.player) {
      return;
    }

    var result = window.PlayerModule.tryMovePlayer(state.player, state.maze, key);
    if (!result.moved) {
      return;
    }

    clearSolveVisuals();
    updateHud();
    renderMaze();

    if (window.PlayerModule.hasPlayerReachedEnd(state.player, state.end)) {
      finalizeWinState();
    }
  }

  // Starts BFS and animates visited cells and shortest path on the grid.
  function solveMazeWithBfs() {
    if (state.isGameWon || state.isSolving || !state.player) {
      return;
    }

    state.isSolving = true;
    state.solveSessionToken += 1;
    var currentSolveToken = state.solveSessionToken;
    clearSolveVisuals();
    renderMaze();

    var bfsResult = window.SolverModule.bfsShortestPath(
      state.maze,
      { row: state.player.row, col: state.player.col },
      state.end
    );

    if (!Array.isArray(bfsResult.path) || bfsResult.path.length === 0) {
      state.isSolving = false;
      alert("No path found from the current player position.");
      return;
    }

    window.SolverModule.animateBfsSolution({
      visitedOrder: bfsResult.visitedOrder,
      path: bfsResult.path,
      visitedStepDelay: 13,
      pathStepDelay: 75,
      onVisit: function (cell) {
        if (currentSolveToken !== state.solveSessionToken) {
          return;
        }

        var key = keyForCell(cell.row, cell.col);
        var isStart = cell.row === state.start.row && cell.col === state.start.col;
        var isEnd = cell.row === state.end.row && cell.col === state.end.col;

        if (!isStart && !isEnd) {
          state.visitedCells.add(key);
          renderMaze();
        }
      },
      onPathStep: function (cell) {
        if (currentSolveToken !== state.solveSessionToken) {
          return;
        }

        var key = keyForCell(cell.row, cell.col);
        var isStart = cell.row === state.start.row && cell.col === state.start.col;
        var isEnd = cell.row === state.end.row && cell.col === state.end.col;

        if (!isStart && !isEnd) {
          state.solutionCells.add(key);
        }

        state.player.row = cell.row;
        state.player.col = cell.col;
        renderMaze();
      },
      onComplete: function () {
        if (currentSolveToken !== state.solveSessionToken) {
          return;
        }

        state.isSolving = false;
        if (window.PlayerModule.hasPlayerReachedEnd(state.player, state.end)) {
          finalizeWinState();
        }
      },
    });
  }

  // Creates a fresh random maze with the current difficulty.
  function generateNewRandomMaze() {
    if (state.isSolving) {
      return;
    }

    loadMazeByDifficulty(state.difficulty, false);
  }

  // Reloads maze settings when user changes difficulty selection.
  function changeDifficulty() {
    if (!dom.difficultySelect) {
      return;
    }

    var selected = dom.difficultySelect.value;
    loadMazeByDifficulty(selected, selected === "easy");
  }

  // Attaches all click, keyboard, and resize event listeners.
  function bindEventListeners() {
    if (dom.restartBtn) {
      dom.restartBtn.addEventListener("click", restartCurrentMaze);
    }

    if (dom.overlayRestartBtn) {
      dom.overlayRestartBtn.addEventListener("click", restartCurrentMaze);
    }

    if (dom.solveBtn) {
      dom.solveBtn.addEventListener("click", solveMazeWithBfs);
    }

    if (dom.newMazeBtn) {
      dom.newMazeBtn.addEventListener("click", generateNewRandomMaze);
    }

    if (dom.difficultySelect) {
      dom.difficultySelect.addEventListener("change", changeDifficulty);
    }

    window.addEventListener("keydown", handleKeyMovement);
    window.addEventListener("resize", renderMaze);
    // D-pad button controls for mobile
var dpadMap = {
  dpadUp: "ArrowUp",
  dpadDown: "ArrowDown",
  dpadLeft: "ArrowLeft",
  dpadRight: "ArrowRight",
};

Object.keys(dpadMap).forEach(function (id) {
  var btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", function () {
      handleKeyMovement({ key: dpadMap[id], preventDefault: function () {} });
    });
  }
});

// Swipe gesture support for mobile
var touchStartX = 0;
var touchStartY = 0;

document.addEventListener("touchstart", function (e) {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", function (e) {
  var dx = e.changedTouches[0].clientX - touchStartX;
  var dy = e.changedTouches[0].clientY - touchStartY;
  var absDx = Math.abs(dx);
  var absDy = Math.abs(dy);

  if (Math.max(absDx, absDy) < 30) return; // too short, ignore

  var swipeKey;
  if (absDx > absDy) {
    swipeKey = dx > 0 ? "ArrowRight" : "ArrowLeft";
  } else {
    swipeKey = dy > 0 ? "ArrowDown" : "ArrowUp";
  }

  handleKeyMovement({ key: swipeKey, preventDefault: function () {} });
}, { passive: true });
  }

  // Initializes all modules and starts the first game instance.
  function initializeGame() {
    if (!window.MazeModule || !window.PlayerModule || !window.SolverModule) {
      console.error("One or more game modules are missing.");
      return;
    }

    bindEventListeners();
    loadMazeByDifficulty("easy", true);
  }

  document.addEventListener("DOMContentLoaded", initializeGame);
})();
