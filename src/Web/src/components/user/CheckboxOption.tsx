import { Checkbox } from "@/components/ui/checkbox";
import { Label as UILabel } from "@/components/ui/label";

interface CheckboxOptionProps {
    id: string;
    label: string;
    checked: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

export function CheckboxOption({ id, label, checked, onToggle, disabled }: CheckboxOptionProps) {
    return (
        <div className="flex items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm hover:bg-accent/50 transition-colors">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={onToggle}
                disabled={disabled}
            />
            <div className="grid gap-1.5 leading-none">
                <UILabel
                    htmlFor={id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                    {label}
                </UILabel>
            </div>
        </div>
    );
}
