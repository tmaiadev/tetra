import intro from './intro';
import './index.css';

// Disable bouncing scroll on iOS
document.addEventListener('touchmove', evt => evt.preventDefault(), { passive: false });

// Init intro
intro();