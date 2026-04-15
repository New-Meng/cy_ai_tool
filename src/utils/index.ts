export const createCursorDot = (): HTMLSpanElement => {
  const dot = document.createElement("span");
  dot.textContent = " ";
  dot.classList.add("custom-golbal-cursor-dot");
  return dot;
};

export const removeCursorDot = () => {
  const dot = document.querySelector(".custom-golbal-cursor-dot");
  if (dot) {
    dot.remove();
  }
};