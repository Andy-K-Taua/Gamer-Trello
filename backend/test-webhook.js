// ./backend/test-webhook.js

const mockEvent = {
    id: "evt_test_" + Date.now(),
    type: "checkout.session.completed",
    data: {
        object: {
            id: "cs_test_12345",
            metadata: { userId: "your_actual_user_id_here" }
        }
    }
};

const runTest = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/subscriptions/webhook', {
      method: 'POST',
      headers: { 
        'x-test-mode': 'true', 
        'Content-Type': 'application/json' // Must match the express.raw type
      },
      body: JSON.stringify({
        id: "evt_test_" + Date.now(),
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123" } }
      })
    });

    // Change: Don't use .json() if the server might return text
    const text = await response.text(); 
    console.log("Response Status:", response.status);
    console.log("Response Body:", text);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
};
runTest();