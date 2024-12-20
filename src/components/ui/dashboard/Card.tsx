import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ title, description, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-primary-200 bg-white p-6 shadow-sm transition-all hover:shadow-md",
        className
      )}
      {...props}
    >
      {title && <h3 className="text-lg font-semibold text-primary-600 mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {children}
    </div>
  );
}