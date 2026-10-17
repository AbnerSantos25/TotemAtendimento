import { useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { userService } from "@/services/UserService";
import { GetLocalized } from "@/shared/localization/i18n";
import { Labels, Messages, Errors } from "@/shared/localization/keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { passwordSchema } from "@/lib/schemas/passwordSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const userSchema = z.object({
    fullName: z.string().min(1, GetLocalized(Errors.FullNameRequired)),
    email: z.string().min(1, GetLocalized(Errors.EmailRequired)).email(GetLocalized(Errors.InvalidEmail)),
    password: passwordSchema,
    confirmPassword: z.string().min(1, GetLocalized(Errors.PasswordMinLength)),
}).refine((data) => data.password === data.confirmPassword, {
    message: GetLocalized(Errors.PasswordsDoNotMatch),
    path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const { reset } = form;
    useEffect(() => {
        if (open) reset();
    }, [open, reset]);

    const isSubmitting = form.formState.isSubmitting;

    const onSubmit = async (data: UserFormValues) => {
        const response = await userService.registerUserAsync(data);

        if (response.success) {
            AGShowMessage.success({ title: GetLocalized(Labels.Success), description: GetLocalized(Messages.UserRegisteredSuccessfully) });
            onOpenChange(false);
            onSuccess();
        } else if (!response.success && response.error) {
            let desc = response.error.message || GetLocalized(Errors.UnableToRegisterUser);

            if (response.error.validationErrors) {
                const errors = Object.values(response.error.validationErrors).flat();
                if (errors.length > 0) {
                    desc = errors.join("\n");
                }
            }

            AGShowMessage.error({ title: GetLocalized(Errors.RegistrationFailureTitle), description: desc });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{GetLocalized(Labels.RegisterNewUser)}</DialogTitle>
                    <DialogDescription>
                        {GetLocalized(Messages.RegisterNewUserDescription)}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{GetLocalized(Labels.FullName)}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="João da Silva" autoFocus disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{GetLocalized(Labels.Email)}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="joao@empresa.com" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{GetLocalized(Labels.AccessPassword)}</FormLabel>
                                    <FormControl>
                                        <PasswordInput disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{GetLocalized(Labels.ConfirmPassword)}</FormLabel>
                                    <FormControl>
                                        <PasswordInput disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{GetLocalized(Labels.Cancel)}</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? GetLocalized(Labels.Registering) : GetLocalized(Labels.RegisterAccount)}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
