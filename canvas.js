export function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.classList.add('main-canvas')
  const ctx = canvas.getContext('2d');

  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  return { canvas, ctx };
}
