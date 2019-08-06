import { isMobile } from './helpers';

const en = {
  START_ACTION: isMobile ? 'Tap to Start' : 'Press ENTER',
  CONTINUE_ACTION: isMobile ? 'Tap to Continue' : 'Press ENTER',
  INSTRUCTIONS: 'INSTRUCTIONS',
  INSTRUCTIONS_PARAGRAPHS: isMobile
    ? [
        'RIGHT/LEFT - tap on the desired side of the screen',
        'ROTATE - swipe up',
        'INSTANT FALL - swipe down',
    ]
    : [
      'RIGHT/LEFT - right and left arrow key',
      'ROTATE - up arrow key or spacebar',
      'INSTANT FALL - down arrow key',
      'PAUSE - p',
    ],
  SCORE: 'Score',
  BEST: 'Best',
};

const pt = {
  START_ACTION: isMobile ? 'Toque para Começar' : 'Pressione ENTER',
  CONTINUE_ACTION: isMobile ? 'Toque para Continuar' : 'Pressione ENTER',
  INSTRUCTIONS: 'INSTRUÇÕES',
  INSTRUCTIONS_PARAGRAPHS: isMobile
    ? [
        'DIREITA/ESQUERDA - toque no lado desejado da tela',
        'GIRAR - deslize o dedo para cima',
        'QUEDA BRUSCA - deslize o dedo para baixo',
    ]
    : [
      'DIREITA/ESQUERDA - use as setas direita e esquerda',
      'GIRAR - seta para cima, ou barra de espaço',
      'QUEDA BRUSCA - seta para baixo',
      'PAUSAR - p',
    ],
  SCORE: 'Pontos',
  BEST: 'Recorde',
};

const lang = navigator.language === 'pt-BR'
  ? pt : en;

export default lang;