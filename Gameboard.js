import Cell from './Cell.js';
import config from './config.js';

const DIRECTION = {
  up: 1,
  right: 2,
  down: 3,
  left: 4
};

export default class Gameboard {
  constructor(width, height, cellCount) {
    this.gameInProgress = false;
    this.bgColor = config.bgColor;
    this.width = width;
    this.height = height;
    this.cellCount = cellCount;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    let id = 1;
    while (document.getElementById('canvas' + id) !== null) id++;
    this.canvas.id = id + '';

    this.context = this.canvas.getContext('2d');

    this.message = '';
    this.cells = [];
  }

  clearCanvas() {
    this.context.fillStyle = this.bgColor;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  setupGrid() {
    this.cols = this.cellCount;
    this.rows = this.cellCount;
    this.cellSize = this.width / this.cellCount;

    this.grid = new Array(this.cols);
    for (let i = 0; i < this.cols; i++) {
      this.grid[i] = new Array(this.rows);
      for (let j = 0; j < this.rows; j++) {
        this.cells.push((this.grid[i][j] = new Cell(i, j, this.cellSize, 0)));
      }
    }
  }

  drawGrid() {
    this.cycleGrid(cell => {
      cell.render(this.context);
    });
  }

  cycleGrid(func, direction = DIRECTION.up) {
    switch (direction) {
      case DIRECTION.down:
      case DIRECTION.right:
        for (let i = this.cellCount - 1; i >= 0; i--) {
          for (let j = this.cellCount - 1; j >= 0; j--) {
            func.call(this, this.grid[i][j], direction);
          }
        }
        break;

      default:
        this.grid.forEach(row =>
          row.forEach(cell => func.call(this, cell, direction))
        );
        break;
    }
  }

  getCellFromCoords(x, y) {
    return this.grid[Math.floor(x / this.cellSize)][
      Math.floor(y / this.cellSize)
    ];
  }

  toggleFlag(cell) {
    cell.isFlagged = !cell.isFlagged;
  }

  getCellNeighbour(cell, direction) {
    let neighbour = null;
    switch (direction) {
      case DIRECTION.up:
        if (cell.posY > 0) {
          neighbour = this.grid[cell.posX][cell.posY - 1];
        }
        break;

      case DIRECTION.right:
        if (cell.posX < this.cellCount - 1) {
          neighbour = this.grid[cell.posX + 1][cell.posY];
        }
        break;

      case DIRECTION.down:
        if (cell.posY < this.cellCount - 1) {
          neighbour = this.grid[cell.posX][cell.posY + 1];
        }
        break;

      case DIRECTION.left:
        if (cell.posX > 0) {
          neighbour = this.grid[cell.posX - 1][cell.posY];
        }
        break;

      default:
        break;
    }
    return neighbour;
  }

  moveCell(cell, direction) {
    if (cell.value === 0) return;
    let neighbour = cell;
    let destination = null;
    while (
      neighbour === cell ||
      (neighbour !== null && neighbour.value === 0)
    ) {
      destination = neighbour;
      neighbour = this.getCellNeighbour(neighbour, direction);
    }
    if (destination instanceof Cell) {
      const [x, y] = [cell.posX, cell.posY];
      if (destination.value === 0) {
        [cell.value, destination.value] = [destination.value, cell.value];
      }
    }
  }

  mergeCell(cell, direction) {
    if (cell.value === 0) return;
    const neighbour = this.getCellNeighbour(cell, direction);
    if (neighbour instanceof Cell && neighbour.value == cell.value) {
      neighbour.value += cell.value;
      cell.value = 0;
    }
  }

  startPlayerInteraction() {
    document.addEventListener('keyup', evt => {
      evt.preventDefault();
      if (!this.gameInProgress) return;

      let isGameKey = true;
      switch (evt.key) {
        case 'ArrowUp':
          this.cycleGrid(this.moveCell, DIRECTION.up);
          this.cycleGrid(this.mergeCell, DIRECTION.up);
          this.cycleGrid(this.moveCell, DIRECTION.up);
          break;
        case 'ArrowRight':
          this.cycleGrid(this.moveCell, DIRECTION.right);
          this.cycleGrid(this.mergeCell, DIRECTION.right);
          this.cycleGrid(this.moveCell, DIRECTION.right);
          break;
        case 'ArrowLeft':
          this.cycleGrid(this.moveCell, DIRECTION.left);
          this.cycleGrid(this.mergeCell, DIRECTION.left);
          this.cycleGrid(this.moveCell, DIRECTION.left);
          break;
        case 'ArrowDown':
          this.cycleGrid(this.moveCell, DIRECTION.down);
          this.cycleGrid(this.mergeCell, DIRECTION.down);
          this.cycleGrid(this.moveCell, DIRECTION.down);
          break;
        default:
          isGameKey = false;
      }

      this.addNumber();

      if (isGameKey) {
        this.drawGrid();
      }
    });
  }

  gameOver(win) {
    this.gameInProgress = false;
    this.cycleGrid(cell => (cell.isPlayed = true));
    this.drawGrid();
    if (win) {
      this.setMessage('HOORAY! You reached 2048!');
    } else {
      this.setMessage('BUMMER! You did not reach 2048 this time!');
    }
  }

  draw() {
    this.drawMessage();
    document.querySelector('body').appendChild(this.canvas);
    this.clearCanvas();

    this.drawGrid();
    this.drawToolbox();
  }

  drawMessage() {
    const messageDisplay = document.createElement('div');
    messageDisplay.classList.add('message');
    messageDisplay.innerHTML = this.message;
    document.querySelector('body').appendChild(messageDisplay);
  }

  drawToolbox() {
    const toolBox = document.createElement('div');
    toolBox.classList.add('toolbox');

    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.id = 'startButton';
    startButton.innerHTML = '✨ Start new game';
    startButton.addEventListener('click', () => this.restartGame());

    toolBox.appendChild(startButton);
    document.querySelector('body').appendChild(toolBox);
  }

  emptyCells() {
    return this.cells.filter(c => c.value === 0);
  }

  addNumber(value, count = 1) {
    for (let i = 0; i < count; i++) {
      const available = this.emptyCells();
      if (available.length === 0) return;
      const index = Math.floor(Math.random() * available.length);
      if (!isNaN(Number(value))) {
        available[index].value = value;
      } else {
        available[index].value = Math.random() > 0.9 ? 4 : 2;
      }
    }
  }

  setMessage(text) {
    this.message = text;
    const messageDisplay = document.querySelector('.message');
    if (messageDisplay === null) {
      this.drawMessage();
    } else {
      messageDisplay.innerHTML = this.message;
    }
  }

  startGame() {
    this.setupGrid();
    this.addNumber(2, 2);
    this.draw();
    this.setMessage('Get to 2048');
    this.startPlayerInteraction();
    this.gameInProgress = true;
  }

  restartGame() {
    this.clearCanvas();
    this.setMessage('Get to 2048');
    this.setupGrid();
    this.drawGrid();
    this.gameInProgress = true;
  }
}
