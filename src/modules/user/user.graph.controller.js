import { GraphQLString } from 'graphql'
import * as userGraphTypes from '../user/types/user.graph.types.js'
import * as userQueryServices from './services/user.graph.query.services.js'

export const query = {
    getAllUsers: {
        type: userGraphTypes.getAllUsers,
        args: {
            authorization: { type: GraphQLString }
        },
        resolve: userQueryServices.getAllUsers
    },


}
