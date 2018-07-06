import config from './config.js';
export default class Cell {
  constructor(col, row, size, value) {
    if (value === undefined) {
      value = 0;
    }
    this.value = value;
    this.size = size;
    this.posX = col;
    this.posY = row;
    this.x = this.posX * this.size;
    this.y = this.posY * this.size;
  }

  render(context) {
    context.strokeStyle = 'black';
    context.fillStyle = config.colors[this.value.toString()];
    context.fillRect(this.x, this.y, this.size, this.size);
    context.strokeRect(this.x, this.y, this.size, this.size);

    if (this.value > 0) {
      context.fillStyle = 'black';
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.font = '20px arial';
      context.fillText(
        this.value,
        this.x + this.size / 2,
        this.y + this.size / 2
      );
    }
  }
}
