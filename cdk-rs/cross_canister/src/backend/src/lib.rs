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

#[query]
fn check_balance() -> f64 {
    RUNTIME_STATE.with(|state| check_balance_impl(&state.borrow_mut()))
}

fn check_balance_impl(runtime_state: &RuntimeState) -> f64 {
    runtime_state.data.account.balance.clone()
}

#[update]
fn top_up(amount: f64) {
    RUNTIME_STATE.with(|state| top_up_impl(&mut state.borrow_mut(), amount))
}

fn top_up_impl(runtime_state: &mut RuntimeState, amount: f64) {
    runtime_state.data.account.balance += amount;
}

#[update]
fn withdraw(amount: f64) {
    RUNTIME_STATE.with(|state| withdraw_impl(&mut state.borrow_mut(), amount))
}

fn withdraw_impl(runtime_state: &mut RuntimeState, amount: f64) {
    runtime_state.data.account.balance -= amount;
}

#[update]
fn create() -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    return match conn.execute(
        "create table person (
            id   INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER
        )",
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
    let mut stmt = match conn.prepare("select * from person limit ?1 offset ?2") {
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
            name: row.get(1).unwrap(),
            age: row.get(2).unwrap(),
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

#[query]
fn query_filter(params: FilterParams) -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    let mut stmt = match conn.prepare("select * from person where name=?1") {
        Ok(e) => e,
        Err(err) => {
            return Err(Error::CanisterError {
                message: format!("{:?}", err),
            })
        }
    };
    let person_iter = match stmt.query_map((params.name,), |row| {
        Ok(PersonQuery {
            id: row.get(0).unwrap(),
            name: row.get(1).unwrap(),
            age: row.get(2).unwrap(),
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
fn insert(person: Person) -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    return match conn.execute(
        "insert into person (name, age) values (?1, ?2);",
        (person.name, person.age),
    ) {
        Ok(e) => Ok(format!("{:?}", e)),
        Err(err) => Err(Error::CanisterError {
            message: format!("{:?}", err),
        }),
    };
}

#[update]
fn delete(id: usize) -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    return match conn.execute("delete from person where id=?1", (id,)) {
        Ok(e) => Ok(format!("{:?}", e)),
        Err(err) => Err(Error::CanisterError {
            message: format!("{:?}", err),
        }),
    };
}

#[update]
fn update(params: UpdateParams) -> Result {
    let conn = ic_sqlite::CONN.lock().unwrap();
    return match conn.execute(
        "update person set name=?1 where id=?2",
        (params.name, params.id),
    ) {
        Ok(e) => Ok(format!("{:?}", e)),
        Err(err) => Err(Error::CanisterError {
            message: format!("{:?}", err),
        }),
    };
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct Person {
    name: String,
    age: usize,
}

#[derive(CandidType, Debug, Serialize, Deserialize, Default)]
struct PersonQuery {
    id: usize,
    name: String,
    age: usize,
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
