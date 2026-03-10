import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { AGShowMessage } from "@/components/AGShowMessage";

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

    if (user) return <Navigate to="/home" replace />;

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