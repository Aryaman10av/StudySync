export default function Card({ as: Element = "article", children, className = "" }) {
  return <Element className={`surface-card${className ? ` ${className}` : ""}`}>{children}</Element>;
}