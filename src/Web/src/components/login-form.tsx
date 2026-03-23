import { useState, type FormEvent } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import loginImg from "../assets/img/AGSoftware.png"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AGShowMessage } from "@/components/AGShowMessage"
import { useAuth } from "@/hooks/useAuth"
import { authService } from "@/services/AuthServices/AuthService"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      AGShowMessage.warning({
        title: "Atenção",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.loginAsync({ email, password });

      if (result.success) {
        AGShowMessage.success({
          title: "Login realizado!",
          description: "Bem-vindo de volta ao painel."
        });
        await signIn(result.data);
      } else {
        AGShowMessage.error({
          title: "Falha na autenticação",
          description: result.error?.message || "E-mail ou senha incorretos."
        });
      }
    } catch (err) {
      AGShowMessage.error({
        title: "Erro no servidor",
        description: "Ocorreu um erro inesperado. Verifique sua conexão."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-balance text-muted-foreground">
                  Faça login na sua conta do Totem Atendimento
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                  {isSubmitting ? "Autenticando..." : "Entrar"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card" />
              <FieldDescription className="text-center">
                Não tem uma conta? <a href="#">Entre em contato com o suporte</a>
              </FieldDescription>
            </FieldGroup>
          </form>
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
        Ao clicar em continuar, você concorda com nossos <a href="#">Termos de Serviço</a>{" "}
        e <a href="#">Política de Privacidade</a>.
      </FieldDescription>
    </div>
  )
}
