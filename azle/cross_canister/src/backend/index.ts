import { Server } from "azle";
import express, { Request } from "express";
import initSqlJs, { Database } from "sql.js/dist/sql-asm.js";

let state: {
  db: Database | null;
} = {
  db: null,
};

async function initSqlJsDb() {
  const SQL = await initSqlJs({});

  const db = new SQL.Database();

  db.run(`
        CREATE TABLE users
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE
            );
    `);

  return db;
}

function queryUsernames(db: Database) {
  // Now, to query and get the usernames
  const results = db.exec("SELECT username FROM users;");

  // Process the results - the structure of `results` is an array of objects, where each object represents a query result set
  let usernames: any[] = [];
  if (results[0] && results[0].values) {
    usernames.push(...results[0].values.map((row) => row[0]));
  }

  return usernames;
}

export default Server(() => {
  const app = express();

  app.use(express.json());

  app.get("/users", async (req, res) => {
    // If db is not initiated
    if (!state.db) {
      state.db = await initSqlJsDb();
    }

    let usernames: any[] = queryUsernames(state.db);
    res.json(usernames);
  });

  app.post("/users/add", async (req, res) => {
    // If db is not initiated
    if (!state.db) {
      state.db = await initSqlJsDb();
    }

    try {
      // Insert a new user
      const username = req.body.username; // The username you want to insert
      const insertSql = `INSERT INTO users (username) VALUES (?);`;

      state.db.run(insertSql, [username]);
    } catch (error) {
      res.json(`Error inserting user: ${JSON.stringify(error)}`);
    }

    let usernames: any[] = queryUsernames(state.db);
    res.json(usernames);
  });

  app.use(express.static("/dist"));

  return app.listen();
});
