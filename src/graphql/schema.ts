import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
    scalar DateTime
    scalar JSON

    """
    Schema (should be equivalent to schema.prisma)
    """
    type User {
        id: String!
        name: String!
        email: String!
        class: [Class!]!
        quizzes: [Quiz!]!
        assignments: [QuizAssignment]!
        questions: [QuizQuestion!]!
    }

    type Class {
        id: String!
        textid: String!
        name: String!
        users: [User!]!
        students: [Student!]!
        groups: [Group!]!
    }

    type Student {
        id: String!
        name: String!
        email: String
        image: String
        passcode: String!
        groups: [Group!]!
        classes: [Class!]!
        quizzes: [QuizAssignment!]
        sessions: [QuizSession!]
    }

    type Group {
        id: String!
        name: String
        passcode: String!
        anonymous: Boolean
        students: [Student!]
        class: Class
        quizzes: [QuizAssignment!]
    }

    type Quiz {
        id: String!
        created: DateTime!
        name: String!
        description: String
        timeLimit: Int
        user: User
        assignments: [QuizAssignment!]
        questions: [QuizQuestionLink!]
    }

    type QuizQuestionLink {
        timeLimit: Int
        quiz: Quiz!
        quizQuestion: QuizQuestion!
    }

    type QuizQuestion {
        id: String!
        type: String!
        category: String!
        content: JSON!
        attribution: String
        quizLinks: [QuizQuestionLink!]
        user: User!
    }

    type QuizAssignment {
        id: String!
        quiz: Quiz!
        assignedBy: User!
        students: [Student!]!
        groups: [Group!]!
        start: DateTime!
        end: DateTime!
        sessions: [QuizSession!]
    }

    type QuizSession {
        id: String!
        start: DateTime!
        finish: DateTime!
        data: JSON!
        student: Student!
        quizAssignment: QuizAssignment!
    }
    
    """
    Input Types
    """
    input GroupInput {
        name: String!
        passcode: String!
        students: [String!]
        anonymous: Boolean
    }

    """
    Empty query field
    Gets extended by resolvers in src/graphql/resolvers/*
    """
    type Query {
        ping: String!
    }

    """
    Empty mutation field
    Gets extended by resolvers in src/graphql/resolvers/*
    """
    type Mutation {
        pingMutation: String!
    }
`;