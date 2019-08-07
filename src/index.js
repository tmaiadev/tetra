import intro from './intro';
import { isMobile } from './helpers';
import str from './strings';
import * as serviceWorker from './serviceWorker';
import innerHeight from 'ios-inner-height';
import './index.css';

// Disable bouncing scroll on iOS
document
  .addEventListener('touchmove', evt => evt.preventDefault(), { passive: false });

// Detect either is mobile or desktop we're running on
document
  .querySelector('.game')
  .classList
  .add(isMobile ? 'mobile' : 'desktop');

// Display strings
document.querySelector('.game').style.height = `${innerHeight()}px`;
document.querySelector('.start').innerHTML = str.START_ACTION;
document.querySelector('.instructions').innerHTML = `
  <p>${str.INSTRUCTIONS}:</p>
  ${
    str
      .INSTRUCTIONS_PARAGRAPHS
      .map(i => `<p>${i}</p>`)
      .join('')
  }
`;
document.querySelector('.score-str').innerHTML = str.SCORE;
document.querySelector('.best-str').innerHTML = str.BEST;

// Init intro
intro();

// Register sw
serviceWorker.register();