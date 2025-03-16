const SUPABASE_URL = "https://jkcayrmgwoesijfqttyw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY2F5cm1nd29lc2lqZnF0dHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDc2NTEsImV4cCI6MjA1NjA4MzY1MX0.RHDL6FnGny07CzXPcsQ73l0Pzp8m3PMIgmOVIC04bsI"; // Replace with your actual key

const API_URL = "https://proctorai-classifier.onrender.com"; // Replace with your actual API URL

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed.");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("🔄 Background script started.");
});

// Function to upload logs to Supabase
// Function to upload logs to Supabase with user ID from Chrome Storage
async function uploadLogs(logs) {
    console.log("🌍 Uploading logs to Supabase:", logs);
  
    // Retrieve user_id from Chrome Storage
    chrome.storage.local.get(["user_id"], async (result) => {
      const storedUserId = result.user_id || null;
  
      const formattedLogs = logs.map(log => ({
        type: log.type,
        data: log.data || {},
        created_at: new Date().toISOString(),
        exam_id: log.exam_id || "2",
        user_id: storedUserId, // Ensure user_id comes from Chrome Storage
        device_type: log.device_type || null,
        screen_width: log.screen_width || null,
        screen_height: log.screen_height || null,
        window_width: log.window_width || null,
        window_height: log.window_height || null,
        risk_score: log.risk_score || null,
        risk_level: log.risk_level || null,
        mouse_score: log.mouse_score || null,
        keyboard_score: log.keyboard_score || null,
        window_score: log.window_score || null,
        test_id: log.test_id || "2f32cf91-bb6c-49ee-84a1-e5e831dd4da0"
      }));
  
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/proctoring_logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify(formattedLogs),
        });
  
        if (response.ok) {
          console.log("✅ Logs uploaded successfully.");
  
          // After successful log upload, trigger scoring
          await triggerScoring(formattedLogs[0].test_id);
        } else {
          console.error("❌ Failed to upload logs:", await response.text());
        }
      } catch (error) {
        console.error("❌ Error uploading logs:", error);
      }
    });
  }
  

// Function to trigger scoring API after logs are uploaded
// Function to trigger scoring API and store risk scores
async function triggerScoring(testId) {
    if (!testId) {
      console.error("⚠️ No Test ID found for scoring request.");
      return;
    }
  
    console.log("🚀 Triggering scoring API for Test ID:", testId);
  
    try {
      const response = await fetch(`${API_URL}/scoring/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_id: testId,
          interval_seconds: 60, // 1-minute intervals
          window_size_seconds: 300 // 15-minute rolling window
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Scoring API response:", data);
  
        // Store risk scores in Chrome Storage
        chrome.storage.local.set({ risk_scores: data.risk_scores[0].risk_score }, () => {
          console.log("📊 Risk scores saved:", data.risk_scores[0].risk_score);
        });
  
      } else {
        console.error("❌ Failed to trigger scoring API:", await response.text());
      }
    } catch (error) {
      console.error("❌ Error triggering scoring API:", error);
    }
  }


  // Create an alarm that triggers every 30 seconds
chrome.alarms.create("updateRiskScores", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateRiskScores") {
    chrome.storage.local.get(["test_id"], (result) => {
      if (result.test_id) {
        triggerScoring(result.test_id);
      }
    });
  }
});

  

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Received message in background.js:", message);

  if (message.type === "LOGS") {
    console.log("🚀 Processing logs:", message.logs);
    uploadLogs(message.logs);
    sendResponse({ status: "received" }); // Send acknowledgment
  }
});
