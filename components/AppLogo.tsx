import Image from "next/image";

type AppLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean; 
};

const SIZE = {
  sm: { width: 32, height: 32, className: "h-8 w-8" },
  md: { width: 44, height: 44, className: "h-11 w-11" },
  lg: { width: 80, height: 80, className: "h-20 w-20" },
} as const;

export default function AppLogo({
  size = "sm",
  className = "",
  priority = false,
}: AppLogoProps) {
  const dimensions = SIZE[size];

  return (
    <Image
      src="/logo.webp"
      alt=""
      width={dimensions.width}
      height={dimensions.height}
      className={`${dimensions.className} shrink-0 bg-transparent object-contain ${className}`.trim()}
      priority={priority}
    />
  );
}
