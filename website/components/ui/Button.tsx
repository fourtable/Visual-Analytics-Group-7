import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary";

/** Class names for a <button> that should look like a Button (used by client components). */
export function buttonClass(variant: Variant = "primary", small = false) {
  return cx(styles.button, styles[variant], small && styles.small);
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  small?: boolean;
  children: ReactNode;
};

/** A link styled as a button: at least 44 px tall, 8 px corners. */
export function Button({
  variant = "primary",
  small = false,
  className,
  children,
  ...rest
}: Props) {
  return (
    <a className={cx(buttonClass(variant, small), className)} {...rest}>
      {children}
    </a>
  );
}
