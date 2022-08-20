import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Login with Passcode',
            credentials: {
                passcode: { label: "Passcode", type: "password" }
            },
            async authorize(credentials, req) {
                // check GraphQL database for our passcode
                if (credentials?.passcode === "abcd") {
                    return {
                        not_sure: true
                    }
                }
                return null;
                const res = await fetch("/your/endpoint", {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                })
                const user = await res.json()

                if (res.ok && user) {
                    return user
                }
                // Return null if user data could not be retrieved
                return null
            }
        })
    ],
});

export default authOptions;