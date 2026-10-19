import { cn } from "cn";

/** Page-width wrapper: `max-w-6xl` with the standard gutter (16px, 32px from 768px). */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 md:px-8", className)} {...props} />;
}
