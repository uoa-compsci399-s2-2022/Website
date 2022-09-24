import { useMemo } from 'react'
import { ApolloClient, createHttpLink, from, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { setContext } from '@apollo/client/link/context';
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'

// Code taken from the next.js 'with-apollo' example
// https://github.com/vercel/next.js/tree/canary/examples/with-apollo

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined = undefined;

function createApolloClient(cookies: any) {
    let origin = process.env.NEXTAUTH_URL;

    if (!origin) {
        // we must be on browser, lets use the URL
        origin = window.location.origin;
    }

    const link = createHttpLink({
        uri: `${origin}/api/graphql/`,
        credentials: 'include',
    });

    const authLink = setContext((_, { headers }) => {
        // build a cookie from the cookies object
        let cookie = "";
        if (Object.keys(cookies).length > 0) {
            for (const cookieKey of Object.keys(cookies)) {
                cookie += `${cookieKey}=${cookies[cookieKey]};`;
            }
        }

        return {
            fetchOptions: {
                credentials: "include"
            },
            headers: {
                ...headers,
                cookie,
            },
        };
    });

    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: authLink.concat(link),
        cache: new InMemoryCache(),
        credentials: 'include',
    })
}

export function initializeApollo(cookies: any, initialState: any = null) {
    const _apolloClient = apolloClient ?? createApolloClient(cookies)

    // If your page has Next.js data fetching methods that use Apollo Client, the initial state
    // gets hydrated here
    if (initialState) {
        // Get existing cache, loaded during client side data fetching
        const existingCache = _apolloClient.extract()

        // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
        const data = merge(existingCache, initialState, {
            // combine arrays using object equality (like in sets)
            arrayMerge: (destinationArray, sourceArray) => [
                ...sourceArray,
                ...destinationArray.filter((d) =>
                    sourceArray.every((s) => !isEqual(d, s))
                ),
            ],
        })

        // Restore the cache with the merged data
        _apolloClient.cache.restore(data)
    }
    // For SSG and SSR always create a new Apollo Client
    if (typeof window === 'undefined') return _apolloClient
    // Create the Apollo Client once in the client
    if (!apolloClient) apolloClient = _apolloClient

    return _apolloClient
}

export function addApolloState(client: any, pageProps: any) {
    if (pageProps?.props) {
        pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
    }

    return pageProps
}

export function useApollo(pageProps: any) {
    const state = pageProps[APOLLO_STATE_PROP_NAME]
    const store = useMemo(() => initializeApollo({}, state), [state])
    return store
}