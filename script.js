const MAX_FRUTAS = 5;
const TOTAL_DISPONIBLES = 7;
const FRUTAS_EMOJI = ['🍎', '🍌', '🍓', '🍊', '🍉'];
const NOMBRES_NUMEROS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco'];

let objetivo = 0;
let contadorActual = 0;
let frutaActual = '🍎';
let bloqueado = false;

const monstruo = document.getElementById('monstruo-zona');
const boca = document.getElementById('boca');
const canasta = document.getElementById('canasta');
const instruccion = document.getElementById('instruccion');
const btnHablar = document.getElementById('btn-hablar');

function hablar(texto) {
  window.speechSynthesis.cancel();
  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = 'es-ES';
  mensaje.rate = 0.95;
  mensaje.pitch = 1.2;
  window.speechSynthesis.speak(mensaje);
}

function tocarSonidoPop(frecuencia = 440) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frecuencia, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(frecuencia * 1.5, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function iniciarRonda() {
  bloqueado = false;
  contadorActual = 0;
  monstruo.classList.remove('feliz', 'abierto');
  boca.textContent = '0';

  objetivo = Math.floor(Math.random() * MAX_FRUTAS) + 1;
  frutaActual = FRUTAS_EMOJI[Math.floor(Math.random() * FRUTAS_EMOJI.length)];

  const texto = `Dame ${objetivo} ${objetivo === 1 ? 'fruta' : 'frutas'}`;
  instruccion.textContent = `${texto} ${frutaActual}`;
  hablar(`¡Tengo hambre! Dame ${NOMBRES_NUMEROS[objetivo]}`);

  generarCanasta();
}

function generarCanasta() {
  canasta.innerHTML = '';
  for (let i = 0; i < TOTAL_DISPONIBLES; i++) {
    const div = document.createElement('div');
    div.className = 'fruta';
    div.textContent = frutaActual;
    habilitarArrastre(div);
    canasta.appendChild(div);
  }
}

function habilitarArrastre(elemento) {
  let offsetX = 0, offsetY = 0;

  elemento.addEventListener('pointerdown', (e) => {
    if (bloqueado) return;
    elemento.setPointerCapture(e.pointerId);
    const rect = elemento.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    elemento.style.position = 'fixed';
    elemento.style.left = rect.left + 'px';
    elemento.style.top = rect.top + 'px';
    elemento.style.zIndex = 1000;
    monstruo.classList.add('abierto');
  });

  elemento.addEventListener('pointermove', (e) => {
    if (!elemento.hasPointerCapture(e.pointerId)) return;
    elemento.style.left = (e.clientX - offsetX) + 'px';
    elemento.style.top = (e.clientY - offsetY) + 'px';
  });

  elemento.addEventListener('pointerup', (e) => {
    if (!elemento.hasPointerCapture(e.pointerId)) return;
    elemento.releasePointerCapture(e.pointerId);
    monstruo.classList.remove('abierto');

    const mRect = monstruo.getBoundingClientRect();
    const fRect = elemento.getBoundingClientRect();
    const centroX = fRect.left + fRect.width / 2;
    const centroY = fRect.top + fRect.height / 2;

    const dentro = centroX > mRect.left && centroX < mRect.right &&
                   centroY > mRect.top && centroY < mRect.bottom;

    if (dentro) {
      elemento.remove();
      procesarEntrega();
    } else {
      elemento.style.position = 'static';
      elemento.style.zIndex = 'auto';
    }
  });
}

function procesarEntrega() {
  contadorActual++;
  boca.textContent = contadorActual;
  tocarSonidoPop(300 + contadorActual * 100);

  if (contadorActual < objetivo) {
    hablar(NOMBRES_NUMEROS[contadorActual]);
  } else if (contadorActual === objetivo) {
    bloqueado = true;
    monstruo.classList.add('feliz');
    instruccion.textContent = '¡Muy bien! 🎉';
    hablar(`¡${NOMBRES_NUMEROS[contadorActual]}! ¡Excelente, lo lograste!`);
    setTimeout(iniciarRonda, 3000);
  } else {
    bloqueado = true;
    instruccion.textContent = '¡Ups! Son muchas. Intentemos de nuevo';
    hablar('¡Ups, son muchas! Intentemos otra vez');
    setTimeout(iniciarRonda, 2800);
  }
}

btnHablar.addEventListener('click', () => {
  if (objetivo === 0) iniciarRonda();
  else hablar(`Dame ${NOMBRES_NUMEROS[objetivo]}`);
});