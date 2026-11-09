import { useVideoLoop } from '../hooks/hooks';

/**
 * Vídeo de fundo fixo: imagem de capa na hora, fita com fade e fumaça carregada depois.
 * Os vídeos começam com preload="none" e sem autoplay: só baixam quando useVideoLoop permite
 * (sem movimento reduzido e sem economia de dados).
 */
export function Fundo() {
  const fita = useVideoLoop(0);
  const fumaca = useVideoLoop(600);
  return (
    <div className="bg" aria-hidden="true">
      <video ref={fita} id="bgv" muted loop playsInline preload="none" tabIndex={-1} width={720} height={1280}>
        <source src="/assets/fita.mp4" type="video/mp4" />
      </video>
      <div className="smoke">
        <video ref={fumaca} id="smk" muted loop playsInline preload="none" tabIndex={-1} width={540} height={960}>
          <source src="/assets/fumaca.mp4" type="video/mp4" />
        </video>
      </div>
      <span className="veil" />
    </div>
  );
}
