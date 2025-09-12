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

    const supabase = createSupabaseClient({ request, cookies });

    // Update the profile metadata to mark that password has been changed
    const currentProfile = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', session.user.id)
      .single();

    const currentMetadata = (currentProfile.data?.metadata || {}) as Record<string, any>;
    const updatedMetadata = {
      ...currentMetadata,
      password_changed_at: new Date().toISOString(),
      force_password_change: false
    };

    const { error } = await supabase
      .from('profiles')
      .update({ metadata: updatedMetadata })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar perfil' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error marking password as changed:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};