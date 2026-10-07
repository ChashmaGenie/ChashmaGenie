export const FACE_QUESTIONS = [
  {
    key: "widest",
    legend: "Where is your face widest?",
    options: [
      { value: "forehead", label: "Forehead" },
      { value: "cheekbones", label: "Cheekbones" },
      { value: "jaw", label: "Jaw" },
    ],
  },
  {
    key: "jaw",
    legend: "What shape is your jawline?",
    options: [
      { value: "rounded", label: "Soft and rounded" },
      { value: "angular", label: "Strong and angular" },
      { value: "pointed", label: "Pointed chin" },
    ],
  },
  {
    key: "length",
    legend: "How long is your face compared to its width?",
    options: [
      { value: "equal", label: "About equal" },
      { value: "longer", label: "Noticeably longer" },
    ],
  },
];

const cheekboneFace = ({ jaw, length }) => {
  if (jaw === "pointed") return "diamond";
  if (length === "longer") return jaw === "angular" ? "oblong" : "oval";
  return jaw === "angular" ? "square" : "round";
};

export const guessFaceShape = (answers) => {
  if (answers.widest === "jaw") return "triangle";
  if (answers.widest === "forehead") return "heart";
  return cheekboneFace(answers);
};

export const isComplete = (answers) => FACE_QUESTIONS.every(({ key }) => Boolean(answers[key]));
