import { useTilt } from "./useTilt.js";
import cutout from "./genie-cutout.webp";

const ALT_TEXT = "The ChashmaGenie mascot, a friendly gold genie with teal hair and beard, holding a pair of gold-framed sunglasses";
const DEPTH_LAYERS = [-5, -10, -15, -20, -25, -30, -35, -40];
const SPARKLES = [
  { top: "8%", left: "78%", size: 18, depth: 90, delay: "0s" },
  { top: "30%", left: "90%", size: 12, depth: 120, delay: "1.2s" },
  { top: "62%", left: "86%", size: 22, depth: 70, delay: "2.1s" },
  { top: "14%", left: "58%", size: 10, depth: 130, delay: "0.6s" },
];

const layerStyle = (z) => ({ transform: `translateZ(${z}px)` });

function DepthStack() {
  return DEPTH_LAYERS.map((z) => (
    <img
      key={z}
      src={cutout}
      alt=""
      aria-hidden="true"
      draggable="false"
      className="genie-scene__layer genie-scene__layer--depth"
      style={layerStyle(z)}
    />
  ));
}

function Sparkles() {
  return SPARKLES.map(({ top, left, size, depth, delay }) => (
    <span
      key={`${top}-${left}`}
      aria-hidden="true"
      className="genie-scene__sparkle"
      style={{ top, left, width: size, height: size, animationDelay: delay, ...layerStyle(depth) }}
    />
  ));
}

export function GenieScene3D({ width = 640, height = 980 }) {
  const ref = useTilt();
  return (
    <div ref={ref} className="genie-scene" role="img" aria-label={ALT_TEXT}>
      <div className="genie-scene__float">
        <div className="genie-scene__stage">
          <div className="genie-scene__card" style={layerStyle(-60)} />
          <DepthStack />
          <img
            src={cutout}
            alt=""
            aria-hidden="true"
            width={width}
            height={height}
            fetchpriority="high"
            decoding="async"
            draggable="false"
            className="genie-scene__layer genie-scene__layer--front"
            style={layerStyle(0)}
          />
          <Sparkles />
          <div className="genie-scene__glare" style={layerStyle(10)} />
        </div>
        <div className="genie-scene__shadow" />
      </div>
    </div>
  );
}
