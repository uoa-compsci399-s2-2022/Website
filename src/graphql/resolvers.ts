import { Context } from '@/pages/api/graphql';
import { DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { Assignment } from './resolvers/assignment';
import { Class } from './resolvers/class';
import { Group } from './resolvers/group';
import { Question } from './resolvers/question';
import { Quiz } from './resolvers/quiz';
import { Session } from './resolvers/session';
import { Student } from './resolvers/student';

export const ProtectQuery = (context: Context, student?: boolean) => {
    if (!context.session || !context.session.user) {
        throw new Error('You must be logged in');
    }

    if (student !== undefined) {
        const isStudent = context.session.user.student ?? false;
        if (isStudent !== student) {
            throw new Error(`You must be a${student ? ' student' : 'n instructor'}`);
        }
    }
};

export const resolvers = {
    JSON: JSONResolver,
    DateTime: DateTimeResolver,
    Query: {
        ping: (_parent: any, _args: any, context: Context) => {
            return 'pong';
        },

        ...Assignment.queries,
        ...Class.queries,
        ...Group.queries,
        ...Question.queries,
        ...Quiz.queries,
        ...Session.queries,
        ...Student.queries,
    },
    Mutation: {
        pingMutation: (_parent: any, _arg: any, context: Context) => {
            return 'pongMutation';
        },

        ...Assignment.mutations,
        ...Class.mutations,
        ...Group.mutations,
        ...Question.mutations,
        ...Quiz.mutations,
        ...Session.mutations,
        ...Student.mutations,
    }
}