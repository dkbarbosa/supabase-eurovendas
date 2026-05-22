import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword, session, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && session) nav({ to: "/" });
  }, [session, loading, nav]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) toast.error(error);
      else {
        setSent(true);
        toast.success("Se o e-mail existir, enviamos um link de recuperação.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card p-8 sm:p-10">
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Recuperar acesso
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Esqueci minha senha</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Informe seu e-mail corporativo. Enviaremos um link para você definir uma nova senha.
        </p>

        {sent ? (
          <div className="mt-8 p-4 rounded-lg border border-border/60 bg-card/40 text-sm">
            Verifique sua caixa de entrada. O link expira em alguns minutos.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@euroempreendimentos.com.br"
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
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar link de recuperação"}
            </Button>
          </form>
        )}

        <Link
          to="/login"
          className="inline-flex items-center gap-2 mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}