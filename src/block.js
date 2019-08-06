let prevIndex = -1;

const shapes = [
  // stick
  [
    [
      [1, 1, 1, 1],
    ],
    [
      [1],
      [1],
      [1],
      [1],
    ],
  ],
  // triangle
  [
    [
      [0, 1],
      [1, 1, 1],
    ],
    [
      [1],
      [1, 1],
      [1],
    ],
    [
      [1, 1, 1],
      [0, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
  ],
  // box
  [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  // z
  [
    [
      [1, 1],
      [0, 1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1]
    ],
  ],
  // inverted-z
  [
    [
      [0, 1, 1],
      [1, 1],
    ],
    [
      [1],
      [1, 1],
      [0, 1],
    ],
  ],
  // l
  [
    [
      [1],
      [1],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [1],
    ],
    [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
  ],
  // inverted-l
  [
    [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    [
      [1],
      [1, 1, 1],
    ],
    [
      [1, 1],
      [1],
      [1],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
    ],
  ],
];

function getNewBlockShape() {
  const index = Math.round(Math.random() * (shapes.length - 1));
  if (index === prevIndex) return getNewBlockShape();
  prevIndex = index;
  return shapes[index];
}

export default class {
  constructor() {
    this._shapes = getNewBlockShape();
    this._shapeIndex = Math.round(Math.random() * (this._shapes.length - 1));
    this.x = 8;
    this.y = 0;
  }

  get shape() {
    return this._shapes[this._shapeIndex];
  }

  rotate() {
    this._shapeIndex++;
    if (this._shapeIndex > this._shapes.length - 1) {
      this._shapeIndex = 0;
    }
  }

  unrotate() {
    this._shapeIndex--;
    
    if (this._shapeIndex < 0) {
      this._shapeIndex = this._shapes.length - 1;
    }
  }

  collided(wall) {
    let collided = false;

    this
      .shape
      .forEach((columns, blockY) => {
        const y = blockY + this.y;
        if (y > wall.length - 1) {
          collided = true;
          return;
        }

        columns
          .forEach((filled, blockX) => {
            const x = blockX + this.x;

            if (filled && wall[y][x]) {
              collided = true;
            }
          });
      });

    return collided;
  }
}