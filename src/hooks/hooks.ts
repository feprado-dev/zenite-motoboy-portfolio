import { useEffect, useRef, useState } from 'react';
import { clamp, conexaoLeve, prefereMenosMovimento } from '../lib/motion';

/** Hora atual em "HH:MM", atualizada a cada 20 s. */
export function useRelogio(): string {
  const formatar = (): string => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const [hora, setHora] = useState(formatar);
  useEffect(() => {
    const id = window.setInterval(() => setHora(formatar()), 20000);
    return () => window.clearInterval(id);
  }, []);
  return hora;
}

/** Revela elementos `.rv` quando entram na tela. */
export function useRevelar(): void {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rv'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el, k) => {
      el.style.setProperty('--d', `${(k % 4) * 0.08}s`);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

/**
 * Efeitos ligados à rolagem: barra de progresso, escurecimento do vídeo (--dk),
 * flutuar da fumaça (--py) e parallax da seção "cidade". Devolve se o menu fica sólido.
 */
export function useRolagem(): boolean {
  const [solido, setSolido] = useState(false);
  useEffect(() => {
    const reduce = prefereMenosMovimento();
    const raiz = document.documentElement.style;
    let pendente = false;

    const atualizar = (): void => {
      pendente = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const total = document.documentElement.scrollHeight - vh;
      raiz.setProperty('--py', (y * 0.14).toFixed(1));
      raiz.setProperty('--dk', clamp((y / (vh * 0.8)) * 0.78, 0, 0.78).toFixed(3));
      const barra = document.getElementById('bar');
      if (barra) barra.style.transform = `scaleX(${total > 0 ? clamp(y / total, 0, 1) : 0})`;
      setSolido(y > 40);
      if (!reduce) {
        const cidade = document.getElementById('cidade');
        const fundo = document.getElementById('cityBg');
        if (cidade && fundo) {
          const r = cidade.getBoundingClientRect();
          if (r.bottom > 0 && r.top < vh) {
            fundo.style.setProperty('--py', `${((r.top + r.height / 2 - vh / 2) * -0.14).toFixed(1)}px`);
          }
        }
      }
    };
    const aoRolar = (): void => {
      if (!pendente) {
        pendente = true;
        requestAnimationFrame(atualizar);
      }
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    atualizar();
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);
  return solido;
}

/** Inicia um vídeo mudo em loop e o exibe (fade) quando começa a tocar. */
export function useVideoLoop(atrasoMs: number) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const vid = ref.current;
    if (!vid || prefereMenosMovimento() || conexaoLeve()) return;
    vid.muted = true;
    vid.defaultMuted = true;
    const tocar = (): void => {
      void vid.play().catch(() => undefined);
    };
    const mostrar = (): void => vid.classList.add('on');
    vid.addEventListener('playing', mostrar, { once: true });
    if (!vid.paused && vid.readyState > 2) mostrar();

    const eventos = ['touchstart', 'pointerdown', 'scroll', 'keydown'] as const;
    const retomar = (): void => {
      if (vid.paused) tocar();
    };
    eventos.forEach((ev) => window.addEventListener(ev, retomar, { once: true, passive: true }));

    let timer = 0;
    const iniciar = (): void => {
      timer = window.setTimeout(tocar, atrasoMs);
    };
    // o vídeo secundário só começa depois do load da página
    if (atrasoMs === 0 || document.readyState === 'complete') iniciar();
    else window.addEventListener('load', iniciar, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', iniciar);
      vid.removeEventListener('playing', mostrar);
      eventos.forEach((ev) => window.removeEventListener(ev, retomar));
    };
  }, [atrasoMs]);
  return ref;
}
