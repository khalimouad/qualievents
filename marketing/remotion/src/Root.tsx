import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { fps, totalFrames, VIDEO_HEIGHT, VIDEO_WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QualiConnect"
        component={Video}
        durationInFrames={totalFrames}
        fps={fps}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
