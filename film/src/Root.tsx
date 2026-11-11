import {Composition} from 'remotion';
import {Film} from './Film';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Film"
      component={Film}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={2700}
    />
  );
};
