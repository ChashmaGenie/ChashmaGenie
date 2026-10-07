import { useState } from "react";
import { FACE_SHAPES, FACE_SHAPE_FITS, SHAPES, labelOf } from "@shared/enums.js";
import { Button, Drawer } from "@/components/ui/index.js";
import { RadioCard } from "@/components/quote/ChoiceCards.jsx";

const FACE_DESCRIPTIONS = {
  round: "Width and length are about equal, with soft cheeks and a rounded chin.",
  oval: "Longer than wide, with a gently curved jaw.",
  square: "A strong jaw, with forehead and jaw about the same width.",
  heart: "A wide forehead that narrows to a small chin.",
  diamond: "Cheekbones are the widest point, with a narrow forehead and jaw.",
  oblong: "Noticeably longer than wide, with fairly straight sides.",
  triangle: "The jaw is wider than the forehead.",
};

const joinLabels = (shapes) => shapes.map((shape) => labelOf(SHAPES, shape)).join(", ");

function Verdict({ product, faceShape }) {
  const fits = FACE_SHAPE_FITS[faceShape] ?? [];
  const faceLabel = labelOf(FACE_SHAPES, faceShape).toLowerCase();
  const isMatch = fits.includes(product.shape);
  return (
    <div className="rounded-xl bg-teal-100 p-4 text-teal-700" role="status">
      {isMatch ? (
        <p><strong>{product.name}</strong> is a good match for a {faceLabel} face.</p>
      ) : (
        <p>{labelOf(SHAPES, product.shape)} frames are less typical for a {faceLabel} face, but wear what you love. Styles that usually suit it: {joinLabels(fits)}.</p>
      )}
      <Button to={`/shop?face=${faceShape}`} variant="teal" size="sm" className="mt-3">See frames for {faceLabel} faces</Button>
    </div>
  );
}

export function FaceShapeHelp({ open, onClose, product }) {
  const [faceShape, setFaceShape] = useState(null);
  return (
    <Drawer open={open} onClose={onClose} title="Find your face shape">
      <div className="flex flex-col gap-4">
        <p>Look in a mirror with your hair pulled back. Compare the width of your forehead, cheekbones and jaw, then pick the closest description.</p>
        <fieldset className="grid gap-3">
          <legend className="sr-only">Face shape</legend>
          {FACE_SHAPES.map((shape) => (
            <RadioCard key={shape.value} name="face-shape" value={shape.value} checked={faceShape === shape.value} onChange={setFaceShape} title={shape.label}>
              {FACE_DESCRIPTIONS[shape.value]}
            </RadioCard>
          ))}
        </fieldset>
        {faceShape && product.shape ? <Verdict product={product} faceShape={faceShape} /> : null}
      </div>
    </Drawer>
  );
}
