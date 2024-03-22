use candid::{CandidType, Deserialize};
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse, TransformArgs,
    TransformContext, TransformFunc,
};
use ic_cdk_macros::*;
use serde::Serialize;
use std::cell::RefCell;

thread_local! {
    static INTERVAL_IN_SECONDS: RefCell<u64> = RefCell::default();
    static TIMERS: RefCell<ic_cdk_timers::TimerId> = RefCell::default();
}

#[derive(CandidType, Deserialize, Serialize)]
struct Error {
    message: String,
}

fn count_instructions(start_counter: u64, function_name: String) {
    ic_cdk::println!(
        "Running from {:?}, cycles used: {}",
        function_name,
        ic_cdk::api::instruction_counter() - start_counter
    );
}

fn call_context_count_instructions(start_counter: u64, function_name: String) {
    ic_cdk::println!(
        "Running from {:?}, cycles used: {}",
        function_name,
        ic_cdk::api::call_context_instruction_counter() - start_counter
    );
}

async fn call_http_outcall() {
    let call_start_instructions = ic_cdk::api::call_context_instruction_counter();
    let url = "https://api.kanye.rest/";
    let request_headers = vec![
        HttpHeader {
            name: "Host".to_string(),
            value: "api.kanye.rest:443".to_string(),
        },
        HttpHeader {
            name: "Accept".to_string(),
            value: "application/json".to_string(),
        },
    ];

    let request = CanisterHttpRequestArgument {
        url: url.to_string(),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: None,
        transform: Some(TransformContext {
            function: TransformFunc(candid::Func {
                principal: ic_cdk::api::id(),
                method: "transform_quote".to_string(),
            }),
            context: vec![],
        }),
        headers: request_headers,
    };

    let cycles = 1_604_000_000; // Adjust based on your requirements

    let _ = match http_request(request, cycles).await {
        Ok((response,)) => {
            let msg = String::from_utf8(response.body)
                .unwrap_or_else(|_| "Failed to decode response".to_string());
            ic_cdk::println!("Response: {}", msg);
        }
        Err((_, message)) => {
            let msg = format!("Failed to fetch quote: {}", message);
            ic_cdk::println!("Response: {}", msg);
        }
    };

    call_context_count_instructions(
        call_start_instructions,
        "ic_cdk::call http_outcall".to_string(),
    );
}

#[query]
fn transform_quote(raw: TransformArgs) -> HttpResponse {
    let mut res = HttpResponse {
        status: raw.response.status.clone(),
        body: raw.response.body.clone(),
        headers: vec![],
    };

    if res.status == 200u64 {
        // Here, you might want to further process the response.body to match your Quote struct
        // For simplicity, we're assuming the API returns exactly what we need
        res.body = raw.response.body;
    } else {
        ic_cdk::api::print(format!("Received an error: {:?}", raw));
    }
    res
}

#[ic_cdk::init]
async fn init() {
    let start_instructions = ic_cdk::api::instruction_counter();

    let seconds = 15;
    INTERVAL_IN_SECONDS.with(|interval_ref| {
        interval_ref.replace(seconds);
    });

    let interval = std::time::Duration::from_secs(seconds);
    ic_cdk::println!("Starting a periodic task with interval {:?}", interval);
    let timer_id = ic_cdk_timers::set_timer_interval(interval, || {
        ic_cdk::spawn(call_http_outcall());
    });

    TIMERS.with(|timers_ref| {
        timers_ref.replace(timer_id);
    });

    count_instructions(start_instructions, "init".to_string());
}

#[query]
fn get_interval() -> Result<u64, Error> {
    let start_instructions = ic_cdk::api::instruction_counter();

    let res = INTERVAL_IN_SECONDS.with(|interval_ref| Ok(interval_ref.borrow().clone()));

    count_instructions(start_instructions, "get_interval".to_string());

    res
}

#[update]
fn set_interval(seconds: u64) -> Result<u64, Error> {
    let start_instructions = ic_cdk::api::instruction_counter();

    TIMERS.with(|timers_ref| {
        let timer_id = timers_ref.borrow().clone();
        ic_cdk_timers::clear_timer(timer_id);
    });

    let interval = std::time::Duration::from_secs(seconds);
    ic_cdk::println!("Starting a periodic task with interval {:?}", interval);
    let new_timer_id = ic_cdk_timers::set_timer_interval(interval, || {
        ic_cdk::spawn(call_http_outcall());
    });
    TIMERS.with(|timers_ref| {
        timers_ref.replace(new_timer_id);
    });

    INTERVAL_IN_SECONDS.with(|seconds_ref| {
        seconds_ref.replace(seconds);
    });

    count_instructions(start_instructions, "set_interval".to_string());

    Ok(seconds)
}

// Enable Candid export
ic_cdk::export_candid!();
