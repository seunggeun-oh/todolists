const fs = require('fs');

const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { MongoClient } = require("mongodb");

const expressPlayground = require("graphql-playground-middleware-express").default;
const resolvers = require("./resolvers");

require("dotenv").config();

// Error: ENOENT: no such file or directory, open './typeDefs.graphql'
// https://github.com/didaquis/react-graphql-apollo-example-server/blob/master/src/gql/schemas/index.js
const typeDefs = fs.readFileSync("./src/typeDefs.graphql", "UTF-8");

const start = async () => {
  let app = express();
  const MONGO_DB = process.env.DB_HOST;
  console.log(`Mongo DB ${MONGO_DB}`);

  try {
    const client = await MongoClient.connect(
      MONGO_DB,
      { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    
    const db = client.db();

    const context = { db };
    // TypeError: Cannot read property 'some' of undefined
    // https://github.com/apollographql/apollo-server/issues/2753
    const server = new ApolloServer({ typeDefs, resolvers, context });
    server.applyMiddleware({ app });

    app.get("/", (req, res) => res.end("TodoList API"));
    app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

    app.listen({ port: 4000 }, () => 
      console.log(`GraphQL Sever running @ http://localhost:4000${server.graphqlPath}`));
  } catch (err) {
      console.log(`
      
        Mongo DB Host not found!
        please add DB_HOST environment variable to .env file
        exiting...
      `)
      console.log(err)
      process.exit(1)
  };
};

start();
