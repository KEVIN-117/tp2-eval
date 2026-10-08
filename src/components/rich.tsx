/** Renderiza `código` entre acentos graves sin usar innerHTML (seguro ante XSS). */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/`([^`]+)`/g).map((p, i) => (i % 2 ? <code key={i}>{p}</code> : p))}</>;
}
