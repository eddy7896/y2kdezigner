import NextAuth from "next-auth"

export const authOptions = {
  providers: [
    // Add providers here, e.g., Google, GitHub, Credentials
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Add custom data to session
      return session;
    },
    async jwt({ token, user }) {
      // Add custom data to token
      return token;
    }
  }
}

export default NextAuth(authOptions)
