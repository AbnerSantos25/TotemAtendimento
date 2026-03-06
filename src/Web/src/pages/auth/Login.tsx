import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom"; // 1. IMPORTAMOS O COMPONENTE DE NAVEGAÇÃO

import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/AuthServices/AuthService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Login() {
    // 2. PUXAMOS A VARIÁVEL 'user' DO CONTEXTO TAMBÉM
    const { signIn, isLoading, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!email || !password) {
            setErrorMsg("Por favor, preencha todos os campos.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await authService.loginAsync({ email, password });
            console.log("result", result);
            if (result.success) {
                await signIn(result.data);
                // Note que não precisamos colocar um redirect aqui dentro.
                // Ao chamar signIn, o contexto atualiza a variável 'user' lá em cima, 
                // e o React re-renderiza a tela, caindo no 'if' abaixo!
            } else {
                setErrorMsg(result.error?.message || "Erro ao tentar fazer login.");
            }
        } catch (err) {
            setErrorMsg("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500">Carregando sessão...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Totem Atendimento</CardTitle>
                    <CardDescription>
                        Digite suas credenciais para acessar o painel
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {errorMsg && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                                {errorMsg}
                            </div>
                        )}

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

                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Autenticando..." : "Entrar"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}