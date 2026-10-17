import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Globe, ImageUp, Info, Loader2, RotateCcw, Save, ShieldPlus, Trash2 } from "lucide-react";

import { AGShowMessage } from "@/components/AGShowMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinicSettings } from "@/hooks/useClinicSettings";
import { formatCnpj, normalizeWebsite, onlyDigits } from "@/lib/formatters";
import {
    createClinicSettingsSchema,
    LOGO_ACCEPTED_TYPES,
    LOGO_MAX_BYTES,
    type ClinicSettingsFormValues,
} from "@/lib/schemas/clinicSettingsSchema";
import { GetLocalized } from "@/shared/localization/i18n";
import { Errors, Labels, Messages } from "@/shared/localization/keys";

const EMPTY_VALUES: ClinicSettingsFormValues = { name: "", cnpj: "", websiteUrl: "", logoUrl: null };

const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

export function Configuration() {
    const { settings, loading, update } = useClinicSettings();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoError, setLogoError] = useState<string | null>(null);

    const schema = useMemo(() => createClinicSettingsSchema(), []);
    const form = useForm<ClinicSettingsFormValues>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_VALUES,
    });

    const { isDirty, isSubmitting } = form.formState;
    const preview = useWatch({ control: form.control });

    useEffect(() => {
        if (settings) {
            form.reset({ ...settings, cnpj: formatCnpj(settings.cnpj) });
        }
    }, [settings, form]);

    const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
            setLogoError(GetLocalized(Errors.InvalidLogoFormat));
            return;
        }
        if (file.size > LOGO_MAX_BYTES) {
            setLogoError(GetLocalized(Errors.LogoTooLarge));
            return;
        }

        setLogoError(null);
        const dataUrl = await readFileAsDataUrl(file);
        form.setValue("logoUrl", dataUrl, { shouldDirty: true });
    };

    const handleRemoveLogo = () => {
        setLogoError(null);
        form.setValue("logoUrl", null, { shouldDirty: true });
    };

    const handleDiscard = () => {
        setLogoError(null);
        if (settings) form.reset({ ...settings, cnpj: formatCnpj(settings.cnpj) });
    };

    const onSubmit = async (values: ClinicSettingsFormValues) => {
        const result = await update({
            name: values.name.trim(),
            cnpj: onlyDigits(values.cnpj),
            websiteUrl: normalizeWebsite(values.websiteUrl),
            logoUrl: values.logoUrl,
        });

        if (result.success) {
            AGShowMessage.success({
                title: GetLocalized(Labels.Success),
                description: GetLocalized(Messages.ClinicSettingsSaved),
            });
        } else {
            AGShowMessage.error({
                title: GetLocalized(Labels.Error),
                description: GetLocalized(Errors.FailedToSaveClinicSettings),
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10 max-w-6xl space-y-6">
                <Skeleton className="h-9 w-64" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="h-[480px] lg:col-span-2" />
                    <Skeleton className="h-[480px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-6xl">
            <h1 className="text-3xl font-bold mb-2">{GetLocalized(Labels.Settings)}</h1>
            <div className="mb-8 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{GetLocalized(Messages.ClinicSettingsLocalStorageNotice)}</span>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
                    {/* Formulário */}
                    <Card className="border-sidebar-border/50 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                {GetLocalized(Labels.ClinicData)}
                            </CardTitle>
                            <CardDescription>{GetLocalized(Messages.ClinicSettingsDescription)}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Logo */}
                            <FormField
                                control={form.control}
                                name="logoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.Logo)}</FormLabel>
                                        <div className="flex items-center gap-5">
                                            <button
                                                type="button"
                                                id="clinic-logo-dropzone"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-primary hover:bg-primary/5"
                                            >
                                                {field.value ? (
                                                    <img src={field.value} alt={GetLocalized(Labels.Logo)} className="h-full w-full object-contain p-2" />
                                                ) : (
                                                    <ImageUp className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                                                )}
                                            </button>

                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <Button type="button" id="clinic-logo-upload" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                                        <ImageUp className="mr-2 h-4 w-4" />
                                                        {field.value ? GetLocalized(Labels.ChangeLogo) : GetLocalized(Labels.UploadLogo)}
                                                    </Button>
                                                    {field.value && (
                                                        <Button type="button" id="clinic-logo-remove" variant="ghost" size="sm" onClick={handleRemoveLogo} className="text-destructive hover:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            {GetLocalized(Labels.RemoveLogo)}
                                                        </Button>
                                                    )}
                                                </div>
                                                <FormDescription>{GetLocalized(Messages.LogoUploadHint)}</FormDescription>
                                                {logoError && <p className="text-sm font-medium text-destructive">{logoError}</p>}
                                            </div>

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept={LOGO_ACCEPTED_TYPES.join(",")}
                                                className="hidden"
                                                onChange={handleLogoSelected}
                                            />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Nome */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{GetLocalized(Labels.ClinicName)}</FormLabel>
                                        <FormControl>
                                            <Input id="clinic-name" placeholder="Clínica São Bento" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* CNPJ */}
                                <FormField
                                    control={form.control}
                                    name="cnpj"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{GetLocalized(Labels.Cnpj)}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    id="clinic-cnpj"
                                                    inputMode="numeric"
                                                    placeholder="00.000.000/0000-00"
                                                    {...field}
                                                    onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Site */}
                                <FormField
                                    control={form.control}
                                    name="websiteUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{GetLocalized(Labels.Website)}</FormLabel>
                                            <FormControl>
                                                <div className="flex rounded-md shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
                                                    <span className="inline-flex items-center gap-1.5 rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                                        <Globe className="h-3.5 w-3.5" />
                                                        https://
                                                    </span>
                                                    <Input
                                                        id="clinic-website"
                                                        placeholder="minhaclinica.com.br"
                                                        className="rounded-l-none focus-visible:ring-0"
                                                        {...field}
                                                        onBlur={(e) => {
                                                            field.onChange(normalizeWebsite(e.target.value));
                                                            field.onBlur();
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-6">
                                <Button type="button" id="clinic-discard" variant="outline" onClick={handleDiscard} disabled={!isDirty || isSubmitting}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    {GetLocalized(Labels.Discard)}
                                </Button>
                                <Button type="submit" id="clinic-save" disabled={!isDirty || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {isSubmitting ? GetLocalized(Labels.Saving) : GetLocalized(Labels.SaveChanges)}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pré-visualização */}
                    <Card className="border-sidebar-border/50 h-fit lg:sticky lg:top-6">
                        <CardHeader>
                            <CardTitle className="text-xl">{GetLocalized(Labels.PanelPreview)}</CardTitle>
                            <CardDescription>{GetLocalized(Messages.PanelPreviewDescription)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-lg border shadow-sm">
                                <div className="flex flex-col items-center justify-center bg-white px-4 py-6">
                                    {preview.logoUrl ? (
                                        <img src={preview.logoUrl} alt="" className="mb-2 h-14 max-w-[80%] object-contain" />
                                    ) : (
                                        <ShieldPlus className="mb-2 h-10 w-10 text-[#003A6D]" strokeWidth={1.5} />
                                    )}
                                    <span className="text-center text-sm font-bold uppercase leading-tight text-[#003A6D] break-words max-w-full">
                                        {preview.name || "—"}
                                    </span>
                                </div>
                                <div className="flex h-24 items-center justify-center bg-[#051A2C]">
                                    <span className="text-3xl font-bold text-[#6FC5FF]">N001</span>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-0.5 bg-white py-2 text-[11px] font-bold text-[#003A6D]">
                                    <span>{normalizeWebsite(preview.websiteUrl ?? "") || "—"}</span>
                                    {preview.cnpj && <span className="font-medium opacity-70">CNPJ {preview.cnpj}</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}