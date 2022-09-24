import { gql } from 'apollo-server-micro';

export const Assignment = {
    typeDefs: gql`
        extend type Query {
            myAssignments: String
        }
    `,
    queries: {},
    mutations: {},
}