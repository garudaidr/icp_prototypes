import { ic, Principal } from "azle";
import DatabaseCanister from "../database";
import { Server } from "azle";
import express from "express";

let database: typeof DatabaseCanister;

function getDatabaseCanisterPrincipal(): string {
  if (process.env.DATABASE_CANISTER_PRINCIPAL !== undefined) {
    return process.env.DATABASE_CANISTER_PRINCIPAL;
  }

  throw new Error(`process.env.DATABASE_CANISTER_PRINCIPAL is not defined`);
}

function inititalizeCanister(): void {
  database = DatabaseCanister(
    Principal.fromText(getDatabaseCanisterPrincipal()),
  );
}

export default Server(() => {
  const app = express();

  app.use(express.json());

  app.get("/users", async (req, res) => {
    // If db is not initiated
    if (!database) {
      inititalizeCanister();
    }

    let usernames = await ic.call(database.users);
    res.json(usernames);
  });

  app.post("/users/add", async (req, res) => {
    // If db is not initiated
    if (!database) {
      inititalizeCanister();
    }

    let usernames = await ic.call(database.add_user, req.body.username);
    res.json(usernames);
  });

  app.use(express.static("/dist"));

  return app.listen();
});
