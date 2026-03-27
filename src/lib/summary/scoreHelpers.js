export const PAIN_COLOR = (score) => {
  if (!score || score <= 1) return "#4a8aa8";
  if (score <= 2) return "#4CC189";
  if (score <= 3) return "#FFC659";
  if (score <= 4) return "#FF7473";
  return "#BE3830";
};

export const PAIN_BG = (score) => {
  if (!score || score <= 1) return "#d6eef8";
  if (score <= 2) return "#4CC189";
  if (score <= 3) return "#FFC659";
  if (score <= 4) return "#FF7473";
  return "#BE3830";
};
