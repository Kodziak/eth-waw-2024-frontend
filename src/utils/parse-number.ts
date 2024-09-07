export function parseNumber(number: string): string {
  let num = parseFloat(number.replaceAll(",", "")) / 10 ** 12;
  const suffixes = ["", "k", "M", "B", "T"];
  let suffixIndex = 0;
  while (num >= 1000 && suffixIndex < suffixes.length - 1) {
    suffixIndex++;
    num /= 1000;
  }
  return num.toFixed(3) + suffixes[suffixIndex];
}
