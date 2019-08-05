import controls from './controls';
import Block from './block';

function render_pixel(ctx, size, x, y) {
  const border = 2;
  ctx.fillRect(x * size, y * size - (size * 2), size, border); // top
  ctx.fillRect(x * size, y * size + size - border - (size * 2), size, border); // bottom
  ctx.fillRect(x * size, y * size - (size * 2), border, size); // left
  ctx.fillRect(x * size + size - border, y * size - (size * 2), border, size); // right
  ctx.fillRect(x * size + border * 2, y * size + border * 2 - (size * 2), size / 2, size / 2); // middle
}

function render_block(ctx, size, block) {
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

function render_wall(ctx, size, wall) {
  wall
    .forEach((columns, y) => {
      columns.forEach((filled, x) => {
        if (filled) render_pixel(ctx, size, x, y);
      });
    });
}

function shadow_of_block(block, wall) {
  const shadow = Object.assign({}, block);
  Object.setPrototypeOf(shadow, Block.prototype);

  while (shadow.collided(wall) === false) {
    shadow.y += 1;
  }

  shadow.y -= 1;
  return shadow;
}

function build_empty_wall(nlines) {
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

function merge_block_with_wall(wall, block) {
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

function clear_wall(wall, successCallback) {
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

export default function() {
  const $gameplay = document.querySelector('.gameplay');
  const $canvas = document.querySelector('.canvas');
  const $score = document.querySelector('.score');
  const $best = document.querySelector('.best');

  const WIDTH = $canvas.clientWidth;
  const BLOCK_SIZE = WIDTH / 20;
  const NLINES = Math.floor($canvas.clientHeight / BLOCK_SIZE) + 2;
  const HEIGHT = (NLINES - 2) * BLOCK_SIZE;
  
  $canvas.style.height = `${HEIGHT}px`;
  $canvas.width = WIDTH;
  $canvas.height = HEIGHT;

  const ctx = $canvas.getContext('2d');
  
  const state = {
    score: 0,
    best: parseInt(localStorage.getItem('best') || 0, 10),
    block: new Block(),
    wall: build_empty_wall(NLINES),
    lastFrame: 0,
  }

  function update(ts) {
    const diffts = ts - state.lastFrame;
    const { block, wall } = state;

    if (diffts > 300) {
      block.y += 1;

      if (block.collided(wall)) {
        block.y -= 1;
        merge_block_with_wall(wall, block);
        state.block = new Block();
      }

      clear_wall(wall, () => {
        state.score++;
        const best = parseInt(localStorage.getItem('best') || 0, 10)

        if (state.score > best) {
          state.best = state.score;
          localStorage.setItem('best', state.score);
        }

        $score.innerHTML = state.score;
        $best.innerHTML = state.best;
      });

      state.lastFrame = ts;
    }
    requestAnimationFrame(render);
  }
  
  function render() {
    const { block, wall } = state;
    
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = 'rgb(193, 219, 195)';
    render_block(ctx, BLOCK_SIZE, shadow_of_block(block, wall));

    ctx.fillStyle = 'rgb(108, 108, 108)';
    render_block(ctx, BLOCK_SIZE, block);
    render_wall(ctx, BLOCK_SIZE, wall);
    
    requestAnimationFrame(update);
  }

  controls.on(controls.KEYS.LEFT, () => {
    const { block, wall } = state;
    
    // move block
    block.x -= 1;

    // undo if block collides or is out of sight
    if (block.x < 0 || block.collided(wall)) {
      block.x += 1;
    } 
  });

  controls.on(controls.KEYS.RIGHT, () => {
    const { block, wall } = state;

    // move block
    block.x += 1;

    const blockMaxX = block.x + block
      .shape
      .reduce((prev, curr) => {
        const length = curr.length - 1;
        if (length > prev) prev = length;
        return prev;
      }, 0);

    // undo if block collides or is out of sight
    if (blockMaxX > 19 || block.collided(wall)) {
      block.x -= 1;
    }
  });

  controls.on(controls.KEYS.UP, () => {
    const { block, wall } = state;

    // rotates block
    block.rotate();

    const blockMaxX = block.x + block
      .shape
      .reduce((prev, curr) => {
        const length = curr.length - 1;
        if (length > prev) prev = length;
        return prev;
      }, 0);
    const blockMaxY = block.x + (block.shape.length - 1);

    // undo if block collides or is out of sight
    if (
      blockMaxX > 19 ||
      blockMaxY > NLINES ||
      block.collided(wall)
    ) block.unrotate();
  });

  controls.on(controls.KEYS.DOWN, () => {
    const { block, wall } = state;
    const shadow = shadow_of_block(block, wall);
    block.y = shadow.y;
  });

  $best.innerHTML = state.best;
  $gameplay.classList.remove('hidden');
  update();
}