import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Bienvenido a RR.HH.</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
            localization={{
                variables: {
                    sign_in: {
                        email_label: 'Correo electrónico',
                        password_label: 'Contraseña',
                        button_label: 'Iniciar sesión',
                        social_provider_text: 'Iniciar sesión con {{provider}}',
                        link_text: '¿Ya tienes una cuenta? Inicia sesión',
                    },
                    sign_up: {
                        email_label: 'Correo electrónico',
                        password_label: 'Contraseña',
                        button_label: 'Registrarse',
                        social_provider_text: 'Registrarse con {{provider}}',
                        link_text: '¿No tienes una cuenta? Regístrate',
                    },
                    forgotten_password: {
                        email_label: 'Correo electrónico',
                        button_label: 'Enviar instrucciones',
                        link_text: '¿Olvidaste tu contraseña?',
                    }
                }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthPage;