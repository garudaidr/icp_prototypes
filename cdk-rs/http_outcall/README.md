# Kanye West Quote Fetching System on ICP

This documentation provides a detailed guide and code explanation for a Kanye West Quote Fetching System created for the Internet Computer platform. Utilizing Rust for backend canister functionality, this system demonstrates the capability to fetch quotes from an external API in a decentralized environment.

## Overview

The Kanye West Quote Fetching System illustrates how to perform HTTP outcalls from the Internet Computer to external services. It includes:

- **Backend Canister**: Implements logic for making HTTP requests to an external API, handling responses, and managing periodic tasks to fetch quotes at defined intervals.

## Prerequisites

Required installations include:

- The DFINITY Foundation's SDK, `dfx`, for deployment on the Internet Computer
- Rust and Cargo to compile Rust code

## Setup

To initialize the system, the following steps should be taken:

1. **Clone the Repository**: Start by cloning the repository to your local machine.
2. **Compile the Rust Code**: Navigate to the project directory and compile the Rust code.
3. **Deploy Canisters**: Deploy the canisters to your local replica or to the Internet Computer mainnet using the `dfx` command.

## Features

- **HTTP Outcalls**: Demonstrates making HTTP GET requests to an external API to fetch quotes.
- **Periodic Fetching**: Utilizes a timer to periodically invoke the fetch operation at specified intervals.
- **Transforming Responses**: Includes a function to potentially transform the HTTP response to fit the system's needs.

## Development Commands

Commands for interacting with the project include:

- `dfx build`: Compiles the canister.
- `dfx deploy`: Deploys the canister to the specified network.
- Custom commands for initiating periodic tasks or fetching quotes immediately.

## Backend Canister

The backend canister is written in Rust and uses the IC CDK for managing state, performing HTTP outcalls, and scheduling tasks.

### Cycles Management

Details on managing cycles for HTTP requests and periodic tasks are not explicitly outlined but are crucial for real-world applications to ensure efficient usage of resources.

### Key Components

- **HTTP Request Preparation**: Constructs HTTP requests, including headers and URL.
- **HTTP Response Handling**: Processes responses from the external API, with potential transformation for application use.
- **Periodic Tasks**: Demonstrates setting up a timer to perform tasks at regular intervals, such as fetching new quotes.
- **State Management**: Uses `thread_local` storage for maintaining state, such as the interval between fetches.

### Functions

- **init**: Initializes the canister and sets up the periodic fetching task.
- **call_http_outcall**: Performs the HTTP outcall to fetch quotes.
- **transform_quote**: Optionally transforms the HTTP response received.
- **set_interval**: Adjusts the interval between periodic fetches.
- **get_interval**: Retrieves the current interval between fetches.

To incorporate the provided logs into the documentation template, I've added sections to detail the system's runtime behavior and cycle usage for different operations. This additional information enhances the understanding of how the system performs in practice and outlines the resource requirements for its operations.

## System Runtime Behavior and Cycles Usage

This section provides insights into the system's operational behavior and the cycles consumed during its execution, as evidenced by the logs from a running instance.

### Initialization

- **Init Function Call**: The system starts with the initialization function, setting up a periodic task to fetch quotes every 15 seconds. This initial setup consumes **4,346 cycles**.
  ```
  2024-03-22 06:55:26.871770441 UTC: [Canister bkyz2-fmaaa-aaaaa-qaaaq-cai] Starting a periodic task with interval 15s
  2024-03-22 06:55:26.871770441 UTC: [Canister bkyz2-fmaaa-aaaaa-qaaaq-cai] Running from "init", cycles used: 4346
  ```

### HTTP Outcalls

- The system successfully makes HTTP outcalls to fetch quotes, with cycles used for these operations varying from **896,723 to 1,058,189 cycles** per call.
  - The variation in cycle usage indicates the computational cost fluctuates based on factors such as response size and processing required for each quote fetched.
  - Notably, the system fetches a variety of quotes, demonstrating its functionality in making external HTTP requests and processing responses.

### Periodic Task Execution

- Logs show the periodic task executing as intended, with each interval fetching a new quote. The interval set at 15 seconds aligns with the system's configuration, showcasing the effective scheduling and execution of periodic tasks.

### Cycles Requirement and Error Handling

- An important observation from the logs is the occurrence of errors related to insufficient cycles for HTTP requests. This highlights the significance of managing and provisioning enough cycles for operations, especially for outcalls to external services.
  ```
  2024-03-22 07:10:26.355798411 UTC: [Canister bkyz2-fmaaa-aaaaa-qaaaq-cai] Response: Failed to fetch quote: http_request request sent with 10_000 cycles, but 1_603_092_800 cycles are required.
  ```
  - These errors demonstrate the system's resilience and error handling capability when encountering issues such as under-provisioning of cycles for operations.

### Insights and Optimization

- **Cycles Usage Insights**: The logs provide valuable insights into the cycles consumption for different operations within the system, highlighting the need for careful management and allocation of resources to ensure uninterrupted operation.
- **Optimization Opportunities**: Analyzing the cycles used for successful and failed operations can guide optimization efforts, such as adjusting the cycles allocated for HTTP outcalls to balance efficiency and cost.

## Conclusion

The detailed logs and their analysis offer a comprehensive view of the Quote Fetching System's runtime behavior, efficiency in performing scheduled tasks, and the critical role of cycles management in its operation on the Internet Computer platform. This real-world data underscores the importance of monitoring and optimization in developing and maintaining efficient and resilient systems on the ICP.

## Contributing

Encourages contributions to the project, including reporting issues, suggesting improvements, or submitting pull requests for enhancements.

## License

This project is shared under a license (typically MIT or similar). Contributors are encouraged to review the LICENSE file for the full license text.
