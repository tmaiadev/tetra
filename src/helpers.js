import Block from './block';

export function render_pixel(ctx, size, x, y) {
  const border = 2;
  ctx.fillRect(x * size, y * size - (size * 2), size, border); // top
  ctx.fillRect(x * size, y * size + size - border - (size * 2), size, border); // bottom
  ctx.fillRect(x * size, y * size - (size * 2), border, size); // left
  ctx.fillRect(x * size + size - border, y * size - (size * 2), border, size); // right
  ctx.fillRect(x * size + border * 2, y * size + border * 2 - (size * 2), size / 2, size / 2); // middle
}

export function render_block(ctx, size, block) {
  block
    .shape
    .forEach((columns, y) => {
      columns
        .forEach((filled, x) => {
          if (!filled) return;
          render_pixel(ctx, size, x + block.x, y + block.y);
        });
    });
}

export function render_wall(ctx, size, wall) {
  wall
    .forEach((columns, y) => {
      columns.forEach((filled, x) => {
        if (filled) render_pixel(ctx, size, x, y);
      });
    });
}

export function shadow_of_block(block, wall) {
  const shadow = Object.assign({}, block);
  Object.setPrototypeOf(shadow, Block.prototype);

  while (shadow.collided(wall) === false) {
    shadow.y += 1;
  }

  shadow.y -= 1;
  return shadow;
}

export function build_empty_wall(nlines) {
  const wall = [];

  for (let i = 0; i < nlines; i++) {
    const cols = [];
    for (let j = 0; j < 20; j++) {
      cols.push(0);
    }
    wall.push(cols);
  }

  return wall;
}

export function merge_block_with_wall(wall, block) {
  block
    .shape
    .forEach((columns, blockY) => {
      const y = blockY + block.y;
      columns
        .forEach((filled, blockX) => {
          const x = block.x + blockX;
          if (filled) wall[y][x] = 1;
        });
    });
}

export function clear_wall(wall, successCallback) {
  wall
    .forEach((columns, index) => {
      if (columns.length === columns.filter(cell => cell === 1).length) {
        successCallback();
        wall.splice(index, 1);
        const newline = [];
        for (let i = 0; i < 20; i++) newline.push(0);
        wall.unshift(newline);
      }
    });
}

export const isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);