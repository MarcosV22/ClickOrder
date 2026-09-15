import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface GameButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  title?: string;
  style?: React.CSSProperties;
}

export default function GameButton({
  children,
  icon,
  iconPosition = "left",
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
  title,
  style,
}: GameButtonProps) {
  // Padronização ergonômica: alturas mínimas consistentes, padding equilibrado e tipografia sem inchaço
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "min-h-[36px] px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider leading-tight",
    md: "min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider leading-tight",
    lg: "min-h-[46px] px-6 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider leading-tight",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "btn-primary text-white",
    secondary: "btn-secondary text-cyan-300",
    danger:
      "bg-red-950/20 border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70 hover:text-red-300 transition-all duration-200",
    ghost:
      "bg-transparent border border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all duration-200",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`
        inline-flex items-center justify-center gap-2
        relative rounded-lg border select-none cursor-pointer text-center
        uppercase transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060b1a]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={{ fontFamily: "'Space Mono', monospace", ...style }}
    >
      {icon && iconPosition === "left" && (
        <span className="shrink-0 flex items-center justify-center leading-none text-current" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className="shrink-0 flex items-center justify-center leading-none text-current" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}
