import type { APIRoute } from 'astro';
import { createSupabaseClient, getSession } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const session = await getSession({ request, cookies });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Contraseña actual y nueva son requeridas' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate password strength
    const minLength = newPassword.length >= 8;
    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!minLength || !hasLower || !hasUpper || !hasNumber) {
      return new Response(
        JSON.stringify({ error: 'La nueva contraseña no cumple con los requisitos de seguridad' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // First, verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email || '',
      password: currentPassword
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ error: 'Contraseña actual incorrecta' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Contraseña actualizada exitosamente'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error changing password:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};