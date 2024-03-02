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
    data: Data,
}

#[derive(CandidType, Deserialize, Default)]
struct Data {
    account: AccountItem,
}

#[derive(CandidType, Deserialize, Clone, Default)]
struct AccountItem {
    account_id: String,
    balance: f64,
}

#[pre_upgrade]
fn pre_upgrade() {
    RUNTIME_STATE.with(|state| ic_cdk::storage::stable_save((&state.borrow().data,)).unwrap());
    // passing tuple ( (x,) )
}

#[post_upgrade]
fn post_upgrade() {
    let (data,): (Data,) = ic_cdk::storage::stable_restore().unwrap();
    let runtime_state = RuntimeState { data };

    RUNTIME_STATE.with(|state| *state.borrow_mut() = runtime_state)
}

#[update]
fn create() -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    return match conn.execute(
        "CREATE TABLE users
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE
            );",
        [],
    ) {
        Ok(e) => Ok(format!("{:?}", e)),
        Err(err) => Err(Error::CanisterError {
            message: format!("{:?}", err),
        }),
    };
}

#[query]
fn query(params: QueryParams) -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    let mut stmt = match conn.prepare("SELECT username FROM users;") {
        Ok(e) => e,
        Err(err) => {
            return Err(Error::CanisterError {
                message: format!("{:?}", err),
            })
        }
    };
    let person_iter = match stmt.query_map((params.limit, params.offset), |row| {
        Ok(PersonQuery {
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
    let mut persons = Vec::new();
    for person in person_iter {
        persons.push(person.unwrap());
    }
    let res = serde_json::to_string(&persons).unwrap();
    Ok(res)
}

#[update]
fn insert(username: String) -> Result {
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
struct PersonQuery {
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
