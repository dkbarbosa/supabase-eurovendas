import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  // O Supabase processa o token de recovery do hash da URL automaticamente
  // via onAuthStateChange (evento PASSWORD_RECOVERY).
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Se já há sessão ativa ao chegar aqui (usuário clicou no link), libera o form
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Senha atualizada. Faça login novamente.");
        await supabase.auth.signOut();
        nav({ to: "/login" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card p-8 sm:p-10">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Nova senha
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Defina uma nova senha</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Use no mínimo 8 caracteres. Evite senhas reutilizadas em outros serviços.
        </p>

        {!ready ? (
          <div className="mt-8 p-4 rounded-lg border border-border/60 bg-card/40 text-sm text-muted-foreground">
            Validando link de recuperação...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="space-y-1.5">
              <Label htmlFor="pw" className="text-xs uppercase tracking-wider text-muted-foreground">
                Nova senha
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw2" className="text-xs uppercase tracking-wider text-muted-foreground">
                Confirmar nova senha
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pw2"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 font-medium"
              style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}