export class Entity {
  constructor(x, y, width, height, color) {
    this.x = x || 0,
    this.y = y || 0,
    this.width = width || 10,
    this.height = height || 10;
    this.color = color || "#ff0000";
  }
}

