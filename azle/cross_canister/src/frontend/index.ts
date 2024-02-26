import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("azle-app")
export class AzleApp extends LitElement {
  @property() db: any = {};
  @property() username: string = ""; // Property to hold the username from the input field

  constructor() {
    super();
    this.getUser();
  }

  async getUser() {
    this.db = "Loading...";

    const response = await fetch(
      `${import.meta.env.VITE_CANISTER_ORIGIN}/users`,
    );
    const responseJson = await response.json();

    this.db = responseJson;
  }

  async addUser() {
    if (this.db.includes(this.username)) {
      return;
    }

    this.db = "Loading...";

    const response = await fetch(
      `${import.meta.env.VITE_CANISTER_ORIGIN}/users/add`,
      {
        method: "POST",
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify({
          username: this.username,
        }),
      },
    );
    const responseJson = await response.json();

    this.db = responseJson;
    this.username = ""; // Clear the username after adding
  }

  // Update to handle input event and bind the input value to the `username` property
  handleInput(event: any) {
    this.username = event.target.value;
  }

  render() {
    return html`
      <h1>Azle Add Usernames</h1>

      <div>db: ${JSON.stringify(this.db)}</div>

      <br />

      <div>
        <button @click=${this.getUser}>Test /users</button>
      </div>

      <br />

      <div>
        <input
          type="text"
          .value=${this.username}
          @input=${this.handleInput}
          placeholder="Enter username"
        />
        <button @click=${this.addUser}>Test /users/add</button>
      </div>
    `;
  }
}
