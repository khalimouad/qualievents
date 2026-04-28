import React from "react";
import { Sequence, AbsoluteFill } from "remotion";
import { sceneDurations, sceneStarts } from "./theme";
import { LogoIntro } from "./scenes/LogoIntro";
import { Tagline } from "./scenes/Tagline";
import { EventTypes } from "./scenes/EventTypes";
import { Registration } from "./scenes/Registration";
import { Badges } from "./scenes/Badges";
import { Communication } from "./scenes/Communication";
import { Certificates } from "./scenes/Certificates";
import { Security } from "./scenes/Security";
import { UseCases } from "./scenes/UseCases";
import { CallToAction } from "./scenes/CallToAction";
import { Outro } from "./scenes/Outro";

/** Top-level composition. Each scene is a <Sequence> so its useCurrentFrame()
 *  is local to its own start. Total length = sum of sceneDurations = 2700f = 90s. */
export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      <Sequence from={sceneStarts.logoIntro} durationInFrames={sceneDurations.logoIntro}>
        <LogoIntro />
      </Sequence>
      <Sequence from={sceneStarts.tagline} durationInFrames={sceneDurations.tagline}>
        <Tagline />
      </Sequence>
      <Sequence from={sceneStarts.eventTypes} durationInFrames={sceneDurations.eventTypes}>
        <EventTypes />
      </Sequence>
      <Sequence from={sceneStarts.registration} durationInFrames={sceneDurations.registration}>
        <Registration />
      </Sequence>
      <Sequence from={sceneStarts.badges} durationInFrames={sceneDurations.badges}>
        <Badges />
      </Sequence>
      <Sequence from={sceneStarts.communication} durationInFrames={sceneDurations.communication}>
        <Communication />
      </Sequence>
      <Sequence from={sceneStarts.certificates} durationInFrames={sceneDurations.certificates}>
        <Certificates />
      </Sequence>
      <Sequence from={sceneStarts.security} durationInFrames={sceneDurations.security}>
        <Security />
      </Sequence>
      <Sequence from={sceneStarts.useCases} durationInFrames={sceneDurations.useCases}>
        <UseCases />
      </Sequence>
      <Sequence from={sceneStarts.callToAction} durationInFrames={sceneDurations.callToAction}>
        <CallToAction />
      </Sequence>
      <Sequence from={sceneStarts.outro} durationInFrames={sceneDurations.outro}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
