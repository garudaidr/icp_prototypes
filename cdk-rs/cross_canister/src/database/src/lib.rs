use candid::CandidType;
use ic_cdk::api::call::RejectionCode;
use ic_cdk_macros::*;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

thread_local! {
    static RUNTIME_STATE: RefCell<RuntimeState> = RefCell::default();
}

#[derive(CandidType, Deserialize, Default)]
struct RuntimeState {
    is_table_created: bool, // State to track if the table is created
}

#[pre_upgrade]
fn pre_upgrade() {
    RUNTIME_STATE
        .with(|state| ic_cdk::storage::stable_save((state.borrow().is_table_created,)).unwrap());
}

#[post_upgrade]
fn post_upgrade() {
    let (is_table_created,): (bool,) = ic_cdk::storage::stable_restore().unwrap();
    let runtime_state = RuntimeState { is_table_created };

    RUNTIME_STATE.with(|state| *state.borrow_mut() = runtime_state)
}

fn create() -> Result {
    // First, check if the table has already been created.
    let mut table_already_created = false;
    RUNTIME_STATE.with(|state| {
        table_already_created = state.borrow().is_table_created;
    });

    if table_already_created {
        // If the table is already created, return a message indicating so.
        return Ok("Table has already been created.".to_string());
    }

    let conn = ic_sqlite::CONN.lock().unwrap();
    return match conn.execute(
        "CREATE TABLE IF NOT EXISTS users
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE
            );",
        [],
    ) {
        Ok(_) => {
            RUNTIME_STATE.with(|state| {
                state.borrow_mut().is_table_created = true; // Update the state here
            });
            Ok("Table created successfully".to_string())
        }
        Err(err) => Err(Error::CanisterError {
            message: format!("{:?}", err),
        }),
    };
}

#[query]
fn query(params: QueryParams) -> Result {
    // First, check if the table has already been created.
    let mut table_already_created = false;
    RUNTIME_STATE.with(|state| {
        table_already_created = state.borrow().is_table_created;
    });

    if !table_already_created {
        return Ok(serde_json::to_string(&Vec::<String>::new()).unwrap());
    }

    let conn = ic_sqlite::CONN.lock().unwrap();
    let mut stmt = match conn.prepare("SELECT username FROM users;") {
        Ok(e) => e,
        Err(err) => {
            return Err(Error::CanisterError {
                message: format!("{:?}", err),
            })
        }
    };
    let user_iter = match stmt.query_map((params.limit, params.offset), |row| {
        Ok(UserQuery {
            id: row.get(0).unwrap(),
            username: row.get(1).unwrap(),
        })
    }) {
        Ok(e) => e,
        Err(err) => {
            return Err(Error::CanisterError {
                message: format!("{:?}", err),
            })
        }
    };
    let mut users = Vec::new();
    for user in user_iter {
        users.push(user.unwrap());
    }
    let res = serde_json::to_string(&users).unwrap();
    Ok(res)
}

#[update]
fn insert(username: String) -> Result {
    // Attempt to create the table first and early return on error
    if let Err(err) = create() {
        return Err(err);
    }

    let conn = ic_sqlite::CONN.lock().unwrap();
    return match conn.execute("INSERT INTO users (username) VALUES (?1);", (username,)) {
        Ok(e) => Ok(format!("{:?}", e)),
        Err(err) => Err(Error::CanisterError {
            message: format!("{:?}", err),
        }),
    };
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct User {
    id: usize,
    username: String,
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct UserQuery {
    id: usize,
    username: String,
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct QueryParams {
    limit: usize,
    offset: usize,
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct FilterParams {
    name: String,
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct UpdateParams {
    id: usize,
    name: String,
}

#[derive(CandidType, Deserialize)]
enum Error {
    InvalidCanister,
    CanisterError { message: String },
}

type Result<T = String, E = Error> = std::result::Result<T, E>;

impl From<(RejectionCode, String)> for Error {
    fn from((code, message): (RejectionCode, String)) -> Self {
        match code {
            RejectionCode::CanisterError => Self::CanisterError { message },
            _ => Self::InvalidCanister,
        }
    }
}

// Enable Candid export
ic_cdk::export_candid!();
