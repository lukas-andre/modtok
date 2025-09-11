import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createBrowserClient } from '@supabase/ssr';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Correo enviado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Te hemos enviado un correo a <strong>{email}</strong> con instrucciones para
            restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Si no recibes el correo en los próximos minutos, revisa tu carpeta de spam.
          </p>
        </CardContent>
        <CardFooter>
          <a href="/auth/login" className="text-sm text-primary hover:underline">
            Volver al inicio de sesión
          </a>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para recibir instrucciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <a href="/auth/login" className="text-sm text-muted-foreground hover:text-primary">
          Volver al inicio de sesión
        </a>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;