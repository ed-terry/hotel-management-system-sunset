// Test authentication flow
console.log("Testing authentication...");

// Test 1: Login
fetch("http://localhost:4000/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "admin@hotelmanagement.com",
    password: "Admin123!",
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Login response:", data);

    if (data.token) {
      console.log("✅ Login successful!");
      console.log("User:", data.user);

      // Test 2: Validate token
      return fetch("http://localhost:4000/auth/validate", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
    } else {
      throw new Error("No token received");
    }
  })
  .then((response) => response.json())
  .then((data) => {
    console.log("Validation response:", data);
    console.log("✅ Token validation successful!");
  })
  .catch((error) => {
    console.error("❌ Authentication test failed:", error);
  });
