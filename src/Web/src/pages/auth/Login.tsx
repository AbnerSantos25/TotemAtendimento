import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner"; // 1. Importe o disparador de alertas

import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/AuthServices/AuthService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Login() {
    const { signIn, isLoading, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // REMOVIDO: const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            // 2. Usando o tipo WARNING (Amarelo)
            toast.warning("Atenção", {
                description: "Por favor, preencha todos os campos."
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // toast.success("Login realizado!", {
            //     description: "Bem-vindo de volta ao painel."

            // });
            // return;
            const result = await authService.loginAsync({ email, password });

            if (result.success) {
                // 3. Usando o tipo SUCCESS (Verde)
                toast.success("Login realizado!", {
                    description: "Bem-vindo de volta ao painel."
                });
                await signIn(result.data);
            } else {
                // 4. Usando o tipo ERROR (Vermelho)
                toast.error("Falha na autenticação", {
                    description: result.error?.message || "E-mail ou senha incorretos."
                });
            }
        } catch (err) {
            // 5. Usando o tipo INFO ou ERROR genérico
            toast.error("Erro no servidor", {
                description: "Ocorreu um erro inesperado. Verifique sua conexão."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (user) return <Navigate to="/dashboard" replace />;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500">Carregando sessão...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Totem Atendimento</CardTitle>
                    <CardDescription>
                        Digite suas credenciais para acessar o painel
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* REMOVIDO: A div de mensagem de erro antiga ficava aqui */}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="exemplo@dominio.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="pt-3">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Autenticando..." : "Entrar"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}