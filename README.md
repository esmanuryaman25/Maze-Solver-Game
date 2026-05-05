# Maze Solver Game

## Project Description
Maze Solver Game is a browser-based maze challenge developed as a final project by Esmanur Yaman for the Introduction to Programming course at International Balkan University (IBU). The player navigates from a START cell to an END cell in a 2D grid maze while the game validates each move in real time. The project also includes automatic shortest-path solving with BFS, random solvable maze generation, and multiple difficulty levels.

## Technologies Used
- HTML5
- CSS3 (responsive layout, neon/cyber styling, animations)
- Vanilla JavaScript (modular game logic)

## How to Run
1. Download or clone the repository.
2. Open `index.html` from the `maze_solver` folder in any modern browser.
3. Start playing immediately with keyboard arrow keys.

## Game Features
- 2D maze represented with a JavaScript array (`0` path, `1` wall)
- Defined START and END cells
- Real-time keyboard movement with arrow keys
- Move and collision validation (walls and boundaries)
- Move counter and stopwatch timer
- Restart button for current maze reset
- Animated win overlay with result stats
- BFS shortest-path visualization with animation
- Random maze generation using Recursive Backtracking
- Difficulty levels:
  - Easy (11x11)
  - Medium (15x15)
  - Hard (21x21)

## How to Play
1. Use `Arrow Up`, `Arrow Down`, `Arrow Left`, and `Arrow Right` to move the player.
2. Reach the END cell to finish the maze.
3. Click `Solve` to animate BFS-based shortest path from current position.
4. Click `Restart` to reset the same maze.
5. Click `New Maze` to generate a new random solvable maze.
6. Use the difficulty dropdown to switch maze sizes.

## Algorithms Explained
### BFS (Breadth-First Search)
BFS is used in `solver.js` to find the shortest path from the player's current location to the END cell. The algorithm explores cells level by level using a queue. It stores parent relationships to reconstruct the shortest path once the end is reached.

### Recursive Backtracking (Maze Generation)
Recursive Backtracking is used in `maze.js` to generate random solvable mazes. The algorithm starts from a cell, carves passages in random unvisited directions, and backtracks when no unvisited neighbors remain. This produces connected maze paths where START and END are reachable.

## File Structure
```text
maze_solver/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── maze.js
│   ├── player.js
│   ├── solver.js
│   └── main.js
└── README.md
```
