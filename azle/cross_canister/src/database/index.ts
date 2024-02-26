import { Canister, query, text, update, Vec } from "azle";
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

function queryUsernames(db: Database): text[] {
  // Now, to query and get the usernames
  const results = db.exec("SELECT username FROM users;");

  // Process the results - the structure of `results` is an array of objects, where each object represents a query result set
  let usernames: any[] = [];
  if (results[0] && results[0].values) {
    usernames.push(...results[0].values.map((row) => row[0]));
  }

  return usernames;
}

export default Canister({
  add_user: update([text], Vec(text), async (username) => {
    // If db is not initiated
    if (!state.db) {
      state.db = await initSqlJsDb();
    }

    try {
      // Insert a new user
      const insertSql = `INSERT INTO users (username) VALUES (?);`;

      state.db.run(insertSql, [username]);
    } catch (error) {
        throw `Error inserting user: ${JSON.stringify(error)}`;
    }

    return queryUsernames(state.db);
  }),
  users: query([], Vec(text), async () => {
    // If db is not initiated
    if (!state.db) {
      state.db = await initSqlJsDb();
    }

    return queryUsernames(state.db);
  }),
});
