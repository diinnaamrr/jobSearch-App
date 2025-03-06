import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { attachments } from '../../../utilies/app.graph.shareTypes.js'

export const company = new GraphQLObjectType({
    name: "oneCompanyResponse",
    fields: {
        companyName: { type: GraphQLString },
        companyEmail: { type: GraphQLString },
        logo: { type: attachments },
        coverPic: { type: attachments },
        address: { type: GraphQLString },
        createdBy: { type: GraphQLID }
    }
})







export const getAllCompanies = new GraphQLObjectType({
    name: "getAllCompaniesResponse",
    fields: {
        message: { type: GraphQLString },
        status: { type: GraphQLInt },
        data: { type: new GraphQLList(company) }
    }


})