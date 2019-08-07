import controls from './controls';
import Block from './block';
import {
  render_block,
  render_wall,
  shadow_of_block,
  build_empty_wall,
  merge_block_with_wall,
  clear_wall,
  isMobile,
  vibrate,
} from './helpers';

export default function() {
  const $gameplay = document.querySelector('.gameplay');
  const $canvas = document.querySelector('.canvas');
  const $score = document.querySelector('.score');
  const $best = document.querySelector('.best');
  const $pause = document.querySelector('.pause');
  const $alert = document.querySelector('.alert');

  // Show gameplay
  $gameplay.classList.remove('hidden');

  const WIDTH = $canvas.clientWidth;
  const BLOCK_SIZE = WIDTH / 20;
  const NLINES = Math.floor($canvas.clientHeight / BLOCK_SIZE) + 2;
  const HEIGHT = (NLINES - 2) * BLOCK_SIZE;

  $canvas.style.height = `${HEIGHT}px`;
  $canvas.width = WIDTH;
  $canvas.height = HEIGHT;

  const ctx = $canvas.getContext('2d');
  
  const state = {
    pause: false,
    score: 0,
    speed: 500,
    best: parseInt(localStorage.getItem('best') || 0, 10),
    block: new Block(),
    wall: build_empty_wall(NLINES),
    lastFrame: 0,
    controlsLocked: false,
    gameOver: false,
    gameOverAniFrame: 0,
    newGame: false,
    newGameAniFrame: 0,
  }

  function togglePause() {
    state.pause = !state.pause;
    if (state.pause) {
      state.controlsLocked = true;
      $alert.innerHTML = 'PAUSED';
      $alert.classList.remove('hidden');
      $pause.innerHTML = 'Resume';
    } else {
      state.controlsLocked = false;
      $alert.classList.add('hidden');
      $pause.innerHTML = 'Pause';
    }
  }

  function update(ts) {
    const diffts = ts - state.lastFrame;
    const {
      block,
      wall,
      speed,
      pause,
      gameOver,
      gameOverAniFrame,
      newGame,
      newGameAniFrame,
    } = state;

    if (pause) {
      requestAnimationFrame(update);
      return;
    }

    if (gameOver) {
      const index = wall.length - 1 - gameOverAniFrame;
      
      if (index >= 0) {
        for (let i = 0; i < 20; i++) {
          wall[index][i] = 1;
        }

        state.gameOverAniFrame++;
        requestAnimationFrame(render);
        return;
      }

      $alert.innerHTML = 'GAME OVER';
      $alert.classList.remove('hidden');

      controls.on(controls.KEYS.ENTER, (uid) => {
        controls.clear(uid);
        $alert.classList.add('hidden');
        state.gameOver = false;
        state.gameOverAniFrame = 0;
        state.newGame = true;
        state.newGameAniFrame = 0;
        requestAnimationFrame(update);
      });
      
      return;
    }

    if (newGame) {
      if (wall[newGameAniFrame]) {
        for (let i = 0; i < 20; i++) {
          wall[newGameAniFrame][i] = 0;
        }

        state.newGameAniFrame++;
        requestAnimationFrame(render);
        return;
      }

      state.newGameAniFrame = 0;
      state.newGame = false;
      state.block = new Block();
      state.score = 0;
      state.speed = 500;
      $score.innerHTML = 0;
      requestAnimationFrame(update);
      return;
    }

    if (wall[2].find(b => b === 1)) {
      state.gameOver = true;
      vibrate([150, 30, 150, 30, 150]);
      requestAnimationFrame(render);
      return;
    }

    if (diffts > speed) {
      block.y += 1;

      if (block.collided(wall)) {
        block.y -= 1;
        merge_block_with_wall(wall, block);
        state.block = new Block();
      }

      clear_wall(wall, () => {
        // increase speed
        state.speed -= 10;
        const maxSpeed = isMobile ? 100 : 50;
        if (state.speed < maxSpeed) state.speed = maxSpeed;
        vibrate(500);

        // update score
        state.score++;

        // update best score
        const best = parseInt(localStorage.getItem('best') || 0, 10)
        if (state.score > best) {
          state.best = state.score;
          localStorage.setItem('best', state.score);
        }

        // render score
        $score.innerHTML = state.score;
        $best.innerHTML = state.best;
      });

      state.controlsLocked = false;
      state.lastFrame = ts;
    }

    requestAnimationFrame(render);
  }
  
  function render() {
    const { block, wall, newGame, gameOver } = state;
    
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    if (newGame === false && gameOver === false) {
      ctx.fillStyle = 'rgb(193, 219, 195)';
      render_block(ctx, BLOCK_SIZE, shadow_of_block(block, wall));
    }

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

  controls.on(controls.KEYS.PAUSE, togglePause);

  // adds function to pause button
  $pause.addEventListener('touchstart', (e) => e.stopPropagation());
  $pause.addEventListener('touchend', (e) => {
    e.stopPropagation();
    togglePause();
  });

  $best.innerHTML = state.best;
  update();
}