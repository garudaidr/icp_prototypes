import { ic, Principal, serialize } from "azle";
import DatabaseCanister from "../database";
import { Server } from "azle";
import express from "express";

let database: typeof DatabaseCanister;

function getDatabaseCanisterPrincipal(): string {
  return "bd3sg-teaaa-aaaaa-qaaba-cai";
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

    let usernames = [];
    if (process.env.AZLE_TEST_FETCH === "true") {
      const response = await fetch(
        `icp://${getDatabaseCanisterPrincipal()}/users`,
        {
          body: serialize({
            candidPath: "/src/database/index.did",
            args: [],
          }),
        },
      );
      const responseJson = await response.json();

      usernames = responseJson;
    } else {
      usernames = await ic.call(database.users, {
        args: [],
      });
    }

    res.json(usernames);
  });

  app.post("/users/add", async (req, res) => {
    // If db is not initiated
    if (!database) {
      inititalizeCanister();
    }

    let usernames = [];
    if (process.env.AZLE_TEST_FETCH === "true") {
      const response = await fetch(
        `icp://${getDatabaseCanisterPrincipal()}/add_user`,
        {
          body: serialize({
            candidPath: "/src/database/index.did",
            args: [],
          }),
        },
      );
      const responseJson = await response.json();

      usernames = responseJson;
    } else {
      usernames = await ic.call(database.add_user, {
        args: [req.body.username],
      });
    }

    res.json(usernames);
  });

  app.use(express.static("/dist"));

  return app.listen();
});
