/**
 * The 'index' page is the main page for this site.  If the user is signed out, we
 * will show a landing page.  If a student is logged in, they should see '_student.tsx'
 * If an instructor is logged in, they should see '_instructor.tsx'.
 **/
import type { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { isStudent } from '@/lib/util';
import { addApolloState, initializeApollo } from '@/lib/apollo';
import { authOptions } from './api/auth/[...nextauth]';
import Instructor, { GetClassesQuery } from './_instructor';
import Landing from './_landing';
import StudentPage, { GetUpcomingQuizzesQuery } from './_student';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);

  if (session && session.user) {
    const apolloClient = initializeApollo(context.req.cookies);
    if (!session.user.student) {
      await apolloClient.query({
        query: GetClassesQuery,
      })
    } else {
      await apolloClient.query({
        query: GetUpcomingQuizzesQuery,
      })
    }

    return addApolloState(apolloClient, {
      props: {
        loggedIn: true,
        isStudent: session.user.student ?? false,
      },
    });
  } else {
    return {
      props: {
        loggedIn: false,
        isStudent: false,
      }
    }
  }
};

interface IndexProps {
  loggedIn: boolean,
  isStudent: boolean
}

const Index: NextPage<IndexProps> = ({ loggedIn, isStudent }) => {
  return (
    <>
      <Head>
        <title>spatial skills test</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {
        loggedIn ? (
          isStudent ? (
            <StudentPage />
          ) : (
            <Instructor />
          )
        ) : (
          <Landing />
        )
      }
    </>
  )
};

export default Index
