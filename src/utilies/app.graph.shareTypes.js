import { GraphQLObjectType, GraphQLString } from "graphql";

export const attachments=new GraphQLObjectType({
    name:"oneAttachment",
    fields:{
        secure_url:{type:GraphQLString},
        public_id:{type:GraphQLString}
    }
})