import { GraphQLEnumType, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { attachments } from "../../../utilies/app.graph.shareTypes.js";


export const user = new GraphQLObjectType({
    name: "oneUserResponse",
    fields: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        profilePic: { type: attachments },
        coverPic: { type: attachments },
        email: { type: GraphQLString },
        provider: { type: GraphQLString },

        gender: {
            type: new GraphQLEnumType({
                name: "genderType",
                values: {
                    male: { type: GraphQLString },
                    female: { type: GraphQLString }
                },
            }),

            role: {
                type: new GraphQLEnumType({
                    name: "roleTypes",
                    values: {
                        user: { type: GraphQLString },
                        admin: { type: GraphQLString },
                    }
                })

            },

        }



    }

})












export const getAllUsers = new GraphQLObjectType({
    name: "getAllUsersResponse",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLInt },
        data: { type: new GraphQLList(user) }
    }

})