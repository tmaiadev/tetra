class Controls {
  constructor() {  
    this.KEYS = {
      ENTER: 'ENTER',
      UP: 'UP',
      DOWN: 'DOWN',
      LEFT: 'LEFT',
      RIGHT: 'RIGHT'
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
    window.addEventListener('touchstart', this._onTouchStart);
    window.addEventListener('touchmove', this._onTouchMove);
    window.addEventListener('touchend', this._onTouchEnd);
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
  }

  _onTouchMove(evt) {
    const {
      clientX: x,
      clientY: y,
    } = evt.touches[0];
    
    this._touchMoveX = x;
    this._touchMoveY = y;
  }

  _onTouchEnd() {
    const movedX = this._touchMoveX - this._touchInitX;
    const movedY = this._touchMoveY - this._touchInitY;
    
    const diffX = movedX < 0
      ? movedX * -1 : movedX;
    const diffY = movedY < 0
      ? movedY * -1 : movedY;

    if (diffX < 10 && diffY < 10) {
      // Fire ENTER
      this._fire(this.KEYS.ENTER, this.INPUT_TYPE.TOUCH);
      
      if (this._touchInitX < window.innerWidth / 2) {
        this._fire(this.KEYS.LEFT, this.INPUT_TYPE.TOUCH);
      } else {
        this._fire(this.KEYS.RIGHT, this.INPUT_TYPE.TOUCH);
      }

      return;
    }

    if (diffY > diffX) {
      // Y axis
      if (movedY < 0) {
        // UP
        this._fire(this.KEYS.UP, this.INPUT_TYPE.TOUCH);
      } else {
        // DOWN
        this._fire(this.KEYS.DOWN, this.INPUT_TYPE.TOUCH);
      }
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