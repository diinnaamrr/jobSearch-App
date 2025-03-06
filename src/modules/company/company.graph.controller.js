import * as companyGraphTypes from './types/company.graph.types.js'
import * as companyQueryServices from './services/company.quer.services.js'
import { GraphQLString } from 'graphql'


export const query = {
    getAllCompanies: {
        type: companyGraphTypes.getAllCompanies,
        args: {
            authorization: { type: GraphQLString }
        },
        resolve: companyQueryServices.getAllCompanies
    }
}