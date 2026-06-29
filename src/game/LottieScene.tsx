import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/** Plays a studio-grade Lottie animation for a scene (lazy-loaded). */
export default function LottieScene({ src }: { src: string }) {
  return <DotLottieReact src={src} autoplay loop style={{ width: '100%', height: 'auto' }} />;
}
