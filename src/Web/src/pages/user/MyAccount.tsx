import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangePasswordDialog } from "@/components/user/ChangePasswordDialog";
import { IconMail, IconBadge } from "@tabler/icons-react";

export const MyAccount = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-sidebar-border/50">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {user.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <IconMail size={18} className="text-primary/70" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <IconBadge size={18} className="text-primary/70" />
              <span>Funções: {user.roles?.join(", ") || "Nenhuma"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sidebar-border/50">
          <CardHeader>
            <CardTitle className="text-xl">Segurança</CardTitle>
            <CardDescription>
              Gerencie suas credenciais de acesso e segurança da conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold">Senha</label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-sidebar-border/50">
                <span className="text-sm text-muted-foreground font-mono tracking-widest">••••••••••••</span>
                <ChangePasswordDialog />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyAccount;
