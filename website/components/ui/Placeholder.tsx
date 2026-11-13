/** Unfilled team input, e.g. "[Team member full names]". Styled so it stands out on purpose. */
export function Placeholder({ children }: { children: string }) {
  return (
    <span className="placeholder" data-placeholder="">
      {children}
    </span>
  );
}
