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

#[query]
fn get_all() -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    let mut stmt = match conn.prepare("SELECT username FROM users;") {
        Ok(e) => e,
        Err(err) => {
            return Err(Error::CanisterError {
                message: format!("{:?}", err),
            })
        }
    };
    let user_iter = match stmt.query_map((), |row| {
        Ok(UserQuery {
            username: row.get(0).unwrap(),
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
        users.push(user.unwrap().username);
    }
    let res = serde_json::to_string(&users).unwrap();
    Ok(res)
}

#[update]
fn insert(username: String) -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();

    // Check if the table needs to be created and create it if necessary
    let table_already_created = RUNTIME_STATE.with(|state| state.borrow().is_table_created);
    if !table_already_created {
        match conn.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE);", []) {
            Ok(_) => RUNTIME_STATE.with(|state| state.borrow_mut().is_table_created = true),
            Err(err) => return Err(Error::CanisterError { message: format!("{:?}", err) }),
        };
    }

    // Proceed with inserting the new user
    if let Err(err) = conn.execute("INSERT INTO users (username) VALUES (?1);", &[&username]) {
        return Err(Error::CanisterError {
            message: format!("{:?}", err),
        });
    }

    let mut stmt = match conn.prepare("SELECT username FROM users;") {
        Ok(e) => e,
        Err(err) => {
            return Err(Error::CanisterError {
                message: format!("{:?}", err),
            })
        }
    };
    let user_iter = match stmt.query_map((), |row| {
        Ok(UserQuery {
            username: row.get(0).unwrap(),
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
        users.push(user.unwrap().username);
    }
    let res = serde_json::to_string(&users).unwrap();
    Ok(res)
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct User {
    id: usize,
    username: String,
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct UserQuery {
    username: String,
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
