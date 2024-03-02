document.addEventListener("DOMContentLoaded", () => {
  let db = {};
  let username = "";

  const dbDisplay = document.getElementById("dbDisplay");
  const usernameInput = document.getElementById("usernameInput");
  const getUserBtn = document.getElementById("getUserBtn");
  const addUserBtn = document.getElementById("addUserBtn");

  const updateDbDisplay = () => {
    dbDisplay.textContent = `db: ${JSON.stringify(db)}`;
  };

  const getUser = async () => {
    db = "Loading...";
    updateDbDisplay();

    const response = await fetch(`[YOUR_CANISTER_ORIGIN]/users`);
    const responseJson = await response.json();

    db = responseJson;
    updateDbDisplay();
  };

  const addUser = async () => {
    if (db.includes(username)) {
      return;
    }

    db = "Loading...";
    updateDbDisplay();

    const response = await fetch(`[YOUR_CANISTER_ORIGIN]/users/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const responseJson = await response.json();
    console.log(responseJson);

    db = responseJson;
    username = ""; // Clear the username after adding
    usernameInput.value = ""; // Also clear the input field
    updateDbDisplay();
  };

  const handleInput = (event) => {
    username = event.target.value;
  };

  getUserBtn.addEventListener("click", getUser);
  addUserBtn.addEventListener("click", addUser);
  usernameInput.addEventListener("input", handleInput);

  getUser(); // Initial call to populate the db display
});
