import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"
import type { AppProps } from 'next/app'
import Header from '@/components/header'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return <SessionProvider session={session}>
    <div className='bg-background min-h-screen'>
      <Header />
      <Component {...pageProps} />
    </div>
  </SessionProvider>
}

export default MyApp
