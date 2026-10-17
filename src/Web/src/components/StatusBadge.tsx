import { Badge } from "@/components/ui/badge";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels } from "@/shared/localization/keys";

export function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <Badge variant={isActive ? "default" : "secondary"}>
            {GetLocalized(isActive ? Labels.Active : Labels.Inactive)}
        </Badge>
    );
}
