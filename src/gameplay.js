import controls from './controls';
import Block from './block';
import {
  render_block,
  render_wall,
  shadow_of_block,
  build_empty_wall,
  merge_block_with_wall,
  clear_wall,
} from './helpers';

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
    controlsLocked: false,
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

      state.controlsLocked = false;
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
    const { block, wall, controlsLocked } = state;

    // do nothing if controls are locked
    if (controlsLocked) return;
    
    // move block
    block.x -= 1;

    // undo if block collides or is out of sight
    if (block.x < 0 || block.collided(wall)) {
      block.x += 1;
    } 
  });

  controls.on(controls.KEYS.RIGHT, () => {
    const { block, wall, controlsLocked } = state;

    // do nothing if controls are locked
    if (controlsLocked) return;

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
    const { block, wall, controlsLocked } = state;

    // do nothing if controls are locked
    if (controlsLocked) return;

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
    const { block, wall, controlsLocked } = state;

    // do nothing if controls are locked
    if (controlsLocked) return;

    const shadow = shadow_of_block(block, wall);
    block.y = shadow.y;

    // lock controls
    state.controlsLocked = true;
  });

  $best.innerHTML = state.best;
  $gameplay.classList.remove('hidden');
  update();
}