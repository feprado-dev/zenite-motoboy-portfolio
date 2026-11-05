export const prefereMenosMovimento = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface NavigatorComConexao extends Navigator {
  connection?: { saveData?: boolean; effectiveType?: string };
}

/** Conexão lenta ou modo economia de dados: não carregar vídeo. */
export function conexaoLeve(): boolean {
  const c = (navigator as NavigatorComConexao).connection;
  return !!c && (!!c.saveData || /2g/.test(c.effectiveType ?? ''));
}

export const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));
