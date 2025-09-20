import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add the JWT token to the session so it's available on the client
      session.accessToken = token.accessToken as string
      return session
    },
    async jwt({ token, account, profile }) {
      // If this is the first time signing in, get JWT from our API
      if (account && profile) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            // Store our API's JWT token
            token.accessToken = data.access_token
          } else {
            console.error('Failed to authenticate with our API')
          }
        } catch (error) {
          console.error('Error calling our API:', error)
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign in
  },
})

export { handler as GET, handler as POST }