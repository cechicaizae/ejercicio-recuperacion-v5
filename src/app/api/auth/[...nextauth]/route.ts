import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('Credenciales faltantes');
          return null;
        }

        try {
          const user = await prisma.usuario.findUnique({
            where: { 
              usuario: credentials.username 
            }
          });

          if (!user) {
            console.log('Usuario no encontrado:', credentials.username);
            return null;
          }

          const isValid = await compare(credentials.password, user.clave);
          console.log('Validación de contraseña:', {
            usuario: credentials.username,
            contraseñaValida: isValid
          });

          if (!isValid) {
            console.log('Contraseña incorrecta para usuario:', credentials.username);
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.nombre,
            email: user.usuario,
            role: user.rol
          };
        } catch (error) {
          console.error('Error en autenticación:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST }; 