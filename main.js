import Gameboard from './Gameboard.js';

const gameboard = new Gameboard(400, 400, 4);
window.gameboard = gameboard;

const turdCount = 10 + Math.ceil(Math.random() * 12);

const init = () => {
  gameboard.startGame();
};

init();
