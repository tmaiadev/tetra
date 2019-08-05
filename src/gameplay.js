import controls from './controls';
import Block from './block';

function render_pixel(ctx, size, x, y) {
  const border = 2;
  ctx.fillRect(x * size, y * size, size, border); // top
  ctx.fillRect(x * size, y * size + size - border, size, border); // bottom
  ctx.fillRect(x * size, y * size, border, size); // left
  ctx.fillRect(x * size + size - border, y * size, border, size); // right
  ctx.fillRect(x * size + border * 2, y * size + border * 2, size / 2, size / 2); // middle
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

export default function() {
  const $gameplay = document.querySelector('.gameplay');
  const $canvas = document.querySelector('.canvas');

  const WIDTH = $canvas.clientWidth;
  const BLOCK_SIZE = WIDTH / 20;
  const NLINES = Math.floor($canvas.clientHeight / BLOCK_SIZE) + 2;
  const HEIGHT = (NLINES - 2) * BLOCK_SIZE;
  
  $canvas.style.height = `${HEIGHT}px`;
  $canvas.width = WIDTH;
  $canvas.height = HEIGHT;

  const ctx = $canvas.getContext('2d');
  ctx.fillStyle = `rgb(108, 108, 108)`;
  
  const state = {
    block: new Block(),
    lastFrame: 0,
  }

  function update(ts) {
    const diffts = ts - state.lastFrame;
    if (diffts > 300) {
      state.block.y += 1;
      state.lastFrame = ts;
    }
    requestAnimationFrame(render);
  }
  
  function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    render_block(ctx, BLOCK_SIZE, state.block);
    requestAnimationFrame(update);
  }

  controls.on(controls.KEYS.LEFT, () => {
    state.block.x -= 1;
  });

  controls.on(controls.KEYS.RIGHT, () => {
    state.block.x += 1;
  });

  controls.on(controls.KEYS.UP, () => {
    state.block.rotate();
  });

  $gameplay.classList.remove('hidden');
  update();
}