import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FACE_SHAPES, FACE_SHAPE_FITS, SHAPES, labelOf } from "@shared/enums.js";
import { Button } from "@/components/ui/Button.jsx";
import { Chip } from "@/components/ui/Chip.jsx";
import { Container } from "@/components/ui/Container.jsx";
import { SectionHeading } from "./SectionHeading.jsx";
import { FACE_QUESTIONS, guessFaceShape, isComplete } from "./faceShape.js";

function Question({ question, value, onChange }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-semibold text-ink-900">{question.legend}</legend>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <Chip key={option.value} selected={value === option.value} onClick={() => onChange(question.key, option.value)}>
            {option.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}

function Result({ faceShape }) {
  const faceLabel = labelOf(FACE_SHAPES, faceShape);
  const fits = FACE_SHAPE_FITS[faceShape].map((shape) => labelOf(SHAPES, shape));
  return (
    <div role="status" className="rounded-xl bg-teal-100 p-5 text-teal-700">
      <p className="text-lg font-semibold">Your face looks {faceLabel.toLowerCase()}.</p>
      <p className="mt-1">Frames that tend to suit it: {fits.join(", ")}.</p>
      <Button to={`/shop?face=${faceShape}`} variant="teal" className="mt-4">
        Shop frames for {faceLabel.toLowerCase()} faces
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function FaceShapeFinder() {
  const [answers, setAnswers] = useState({});
  const answer = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));
  return (
    <section aria-labelledby="fit-title" className="py-10 md:py-16">
      <Container>
        <SectionHeading id="fit-title" eyebrow="Find my fit" title="Which frames suit your face?" />
        <div className="grid gap-6 rounded-2xl border border-ink-200 bg-cream-50 p-6 md:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5">
            {FACE_QUESTIONS.map((question) => (
              <Question key={question.key} question={question} value={answers[question.key]} onChange={answer} />
            ))}
          </div>
          <div className="flex items-center">
            {isComplete(answers) ? (
              <Result faceShape={guessFaceShape(answers)} />
            ) : (
              <p className="text-ink-600">Answer the three questions and we will point you to frames that tend to flatter your face shape.</p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
