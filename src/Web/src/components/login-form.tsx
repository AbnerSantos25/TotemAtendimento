import { cn } from "@/lib/utils"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import loginImg from "../assets/img/AGSoftware.png"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AGShowMessage } from "@/components/AGShowMessage"
import { useAuth } from "@/hooks/useAuth"
import { authService } from "@/services/AuthServices/AuthService"
import { GetLocalized } from "@/shared/localization/i18n"
import { Labels, Messages } from "@/shared/localization/keys"

import { Errors } from "@/shared/localization/keys"

const loginSchema = z.object({
  email: z.string().min(1, { message: GetLocalized(Errors.EmailRequired) }).email({
    message: GetLocalized(Errors.InvalidEmailFormat),
  }),
  password: z.string().min(6, {
    message: GetLocalized(Errors.PasswordMinLength),
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await authService.loginAsync({ email: data.email, password: data.password });

      if (result.success) {
        AGShowMessage.success({
          title: GetLocalized(Messages.LoginSuccess),
          description: GetLocalized(Messages.WelcomeBack)
        });
        await signIn(result.data.userView);
      } else {
        AGShowMessage.error({
          title: GetLocalized(Errors.AuthFailure),
          description: result.error?.message || GetLocalized(Errors.IncorrectUsernamePassword)
        });
      }
    } catch (err) {
      AGShowMessage.error({
        title: GetLocalized(Errors.ServerError),
        description: GetLocalized(Errors.UnexpectedConnectionError),
        duration: Infinity
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">{GetLocalized(Messages.WelcomeBack)}</h1>
                  <p className="text-balance text-muted-foreground">
                    {GetLocalized(Labels.EnterCredentials)}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{GetLocalized(Labels.Email)}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="exemplo@dominio.com"
                          disabled={isSubmitting}
                          {...field}
                        />
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
                      <div className="flex items-center">
                        <FormLabel>{GetLocalized(Labels.Password)}</FormLabel>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          {GetLocalized(Labels.ForgotPassword)}
                        </a>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Field>
                  <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                    {isSubmitting ? GetLocalized(Messages.LoadingSystem) : GetLocalized(Labels.EnterButton)}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card" />
                <FieldDescription className="text-center">
                  {GetLocalized(Labels.DontHaveAccount)} <a href="#">{GetLocalized(Labels.ContactSupport)}</a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <img
              src={loginImg}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.6] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {GetLocalized(Messages.TermsAgreement)} <a href="#">{GetLocalized(Labels.SettingsTerms)}</a>{" "}
        e <a href="#">{GetLocalized(Labels.SettingsPrivacy)}</a>.
      </FieldDescription>
    </div>
  )
}
