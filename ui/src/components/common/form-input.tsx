import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ThemedInputProps = {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  value?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FormInput({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  required,
  onChange,
}: ThemedInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-semibold text-[#0e1b17] dark:text-white">
        {label}
      </Label>

      <div
        className={cn(
          "flex items-center rounded-full border transition-all",
          "bg-[#f8fcfa] dark:bg-[#11211c]/50",
          "border-[#d0e7df] dark:border-[#1e3a31]",
          "focus-within:border-[#17cf91]",
        )}
      >
        {icon && <span className="pl-4 pr-2 text-[#4e977f]">{icon}</span>}

        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={onChange}
          className={cn(
            "h-12 border-0 bg-transparent px-0 pr-4 text-sm",
            "text-[#0e1b17] dark:text-white",
            "placeholder:text-[#4e977f]/60",
            "focus-visible:ring-0",
          )}
        />
      </div>
    </div>
  );
}
