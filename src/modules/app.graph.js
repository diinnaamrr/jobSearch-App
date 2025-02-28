import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as userGraphController from './user/user.graph.controller.js'
import * as companyGraphController from './company/company.graph.controller.js'

export const schema = new GraphQLSchema({
query: new GraphQLObjectType({
name:"mainQuery",
description:"main query on dasdhboard",
fields:{
...userGraphController.query,
...companyGraphController.query

}


})


})