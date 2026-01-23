import { Composition, Folder } from "remotion";
import { PicLorePromo } from "./compositions/PicLorePromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="PicLoreAI">
      <Composition
        id="PicLorePromo"
        component={PicLorePromo}
        durationInFrames={600} // 20 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
