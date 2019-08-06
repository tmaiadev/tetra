class Controls {
  constructor() {  
    this.KEYS = {
      ENTER: 'ENTER',
      UP: 'UP',
      DOWN: 'DOWN',
      LEFT: 'LEFT',
      RIGHT: 'RIGHT',
      PAUSE: 'PAUSE',
    };

    this.INPUT_TYPE = {
      TOUCH: 'TOUCH',
      KEYBOARD: 'KEYBOARD'
    };

    this._listeners = [];
    this._init();

    this._touchInitX = 0;
    this._touchInitY = 0;
    this._touchMoveX = 0;
    this._touchMoveY = 0;
  }

  _init() {
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    window.addEventListener('touchstart', this._onTouchStart);
    window.addEventListener('touchmove', this._onTouchMove);
    window.addEventListener('touchend', this._onTouchEnd);
    window.addEventListener('keydown', this._onKeyDown);
  }

  _fire(key, inputType) {
    this._listeners
      .filter(e => e.key === key)
      .forEach(e => e.fn(e.uid, inputType));
  }

  _uid() {
    return Math
      .random()
      .toString(32)
      .substr(2);
  }

  _onTouchStart(evt) {
    const {
      clientX: x,
      clientY: y,
    } = evt.touches[0];
    
    this._touchInitX = x;
    this._touchMoveX = x;
    this._touchInitY = y;
    this._touchMoveY = y;
    this._touchId = this._uid();

    const longPress = (id) => {
      if (this._touchId === null || this._touchId !== id) return;
      
      const { LEFT, RIGHT } = this.KEYS;
      const { TOUCH } = this.INPUT_TYPE;

      if (this._touchInitX < window.innerWidth / 2) {
        this._fire(LEFT, TOUCH);
      } else {
        this._fire(RIGHT, TOUCH);
      }

      setTimeout(longPress.bind(this, id), 150);
    }

    setTimeout(longPress.bind(this, this._touchId), 300);
  }

  _onTouchMove(evt) {
    this._touchId = null;

    const {
      clientX: x,
      clientY: y,
    } = evt.touches[0];
    
    this._touchMoveX = x;
    this._touchMoveY = y;
  }

  _onTouchEnd() {
    this._touchId = null;

    const { TOUCH } = this.INPUT_TYPE;
    const {
      UP,
      DOWN,
      LEFT,
      RIGHT,
      ENTER,
    } = this.KEYS;

    const movedX = this._touchMoveX - this._touchInitX;
    const movedY = this._touchMoveY - this._touchInitY;
    
    const diffX = movedX < 0
      ? movedX * -1 : movedX;
    const diffY = movedY < 0
      ? movedY * -1 : movedY;

    if (diffX < 10 && diffY < 10) {
      // Fire ENTER
      this._fire(ENTER, TOUCH);
      
      if (this._touchInitX < window.innerWidth / 2) {
        this._fire(LEFT, TOUCH);
      } else {
        this._fire(RIGHT, TOUCH);
      }

      return;
    }

    if (diffY > diffX) {
      // Y axis
      if (movedY < 0) {
        // UP
        this._fire(UP, TOUCH);
      } else {
        // DOWN
        this._fire(DOWN, TOUCH);
      }

      return;
    }

    // X axis
    if (movedX < 0) {
      // LEFT
      this._fire(LEFT, TOUCH);
    } else {
      this._fire(RIGHT, TOUCH);
    }
  }

  _onKeyDown(evt) {
    const key = evt.key.toLowerCase();
    const { KEYBOARD } = this.INPUT_TYPE;
    const {
      UP,
      DOWN,
      LEFT,
      RIGHT,
      ENTER,
      PAUSE,
    } = this.KEYS;
    
    switch (key) {
      case 'arrowup':
      case 'w':
        this._fire(UP, KEYBOARD);
        break;

      case 'arrowdown':
      case 's':
        this._fire(DOWN, KEYBOARD);
        break;

      case 'arrowleft':
      case 'a':
        this._fire(LEFT, KEYBOARD);
        break;

      case 'arrowright':
      case 'd':
        this._fire(RIGHT, KEYBOARD);
        break;

      case 'enter':
        this._fire(ENTER, KEYBOARD);
        break;

      case 'p':
        this._fire(PAUSE, KEYBOARD);
        break;

      default:
        break;
    }
  }

  on(key, fn) {
    this._listeners.push({
      uid: this._uid(),
      key,
      fn
    });
  }
  
  clear(uid = undefined) {
    if (!uid) {
      this._listeners = [];
      return;
    }

    this._listeners = this
      ._listeners
      .filter(i => i.uid !== uid);
  }
}

export default new Controls();