import { gql } from 'apollo-server-micro';

export const Group = {
    typeDefs: gql`
        extend type Mutation {
            updateGroup(id: String!, name: String, anonymous: String): Group
            addStudentsToGroup(id: String!, students: [String!]): Group
            removeStudentsFromGroup(id: String!, students: [String!]): Group
            deleteGroup(id: String!): Group
        }
    `,
    queries: {},
    mutations: {

    }
}