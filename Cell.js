import config from './config.js';

function roundRect(ctx, x, y, width, height, radius = 5) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export default class Cell {
  constructor(col, row, value) {
    if (value === undefined) {
      value = 0;
    }
    this.value = value;
    this.posX = col;
    this.posY = row;
    this.size =
      Math.floor(config.size / config.tilesPerRow) -
      Math.floor(1.5 * config.gutterSize);
    this.x =
      this.posX * this.size + config.gutterSize * this.posX + config.gutterSize;
    this.y =
      this.posY * this.size + config.gutterSize * this.posY + config.gutterSize;
  }

  render(context) {
    if (this.value > 0) {
      context.strokeStyle = config.tile.colors.stroke;
      var gradient = context.createLinearGradient(
        this.x,
        this.y,
        this.x + this.size,
        this.y + this.size
      );
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.2, config.tile.colors[this.value.toString()]);
      context.fillStyle = gradient;
    } else {
      context.strokeStyle = config.cell.colors.stroke;
      context.fillStyle = config.cell.colors.bg;
    }
    roundRect(
      context,
      this.x,
      this.y,
      this.size,
      this.size,
      config.tile.cornerRadius
    );

    if (this.value > 0) {
      context.fillStyle = config.tile.colors.text;
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
