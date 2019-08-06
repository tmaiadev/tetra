import controls from './controls';
import gameplay from './gameplay';
import str from './strings';

export default function intro() {
  const $intro = document.querySelector('.intro');
  const $start = document.querySelector('.start');
  const $instructions = document.querySelector('.instructions');
  const $footer = document.querySelector('.footer');

  controls.on(controls.KEYS.ENTER, () => {
    if ($start.classList.contains('hidden')) {
      controls.clear();
      $intro.classList.add('hidden');
      gameplay();
      return;
    }

    $start.classList.add('hidden');
    $instructions.classList.remove('hidden');
    $footer.innerHTML = str.CONTINUE_ACTION;
  });
}