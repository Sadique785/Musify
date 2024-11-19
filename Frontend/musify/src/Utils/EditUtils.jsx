// colorUtils.js

const COLORS = [
  '#FCA5A5', // Light red
  '#F9A8D4', // Light pink
  '#FDE047', // Light yellow
  '#86EFAC', // Light green
  '#5EEAD4', // Light teal
  '#93C5FD', // Light blue
  '#A5B4FC', // Light indigo
  '#C4B5FD', // Light purple
  '#FDBA74', // Light orange
];

export function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
