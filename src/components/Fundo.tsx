import { useVideoLoop } from '../hooks/hooks';

/** Vídeo de fundo fixo: imagem de capa na hora, fita com fade e fumaça carregada depois. */
export function Fundo() {
  const fita = useVideoLoop(0);
  const fumaca = useVideoLoop(600);
  return (
    <div className="bg" aria-hidden="true">
      <video ref={fita} id="bgv" autoPlay muted loop playsInline preload="auto" tabIndex={-1} width={1080} height={1920}>
        <source src="/assets/fita.mp4" type="video/mp4" />
      </video>
      <div className="smoke">
        <video ref={fumaca} id="smk" muted loop playsInline preload="none" tabIndex={-1} width={720} height={1280}>
          <source src="/assets/fumaca.mp4" type="video/mp4" />
        </video>
      </div>
      <span className="veil" />
    </div>
  );
}
