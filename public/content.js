let logs = [];

function logEvent(type, data = {}) {
  logs.push({
    type,
    data,
    timestamp: Date.now(),
    device_type: getDeviceType(),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    window_width: window.innerWidth,
    window_height: window.innerHeight,
  });
}

function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
    return /ipad/.test(userAgent) ? "tablet" : "mobile";
  }
  return "desktop";
}

// Event Handlers
function handleMouseMove(e) {
  logEvent("mouse_move", { x: e.clientX, y: e.clientY });
}

function handleKeyDown(e) {
  logEvent("key_press", { key: e.key });
}

function handleVisibilityChange() {
  logEvent("tab_switch", { status: document.hidden ? "hidden" : "visible" });
}

function handleCopy() {
  logEvent("clipboard", { action: "copy" });
}

function handlePaste(e) {
  logEvent("clipboard", { action: "paste", length: e.clipboardData.getData("text").length || 0 });
}

function handleCut() {
  logEvent("clipboard", { action: "cut" });
}

function handleResize() {
  logEvent("window_resize", {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.innerWidth / window.screen.width,
  });
}

function handleFocus() {
  logEvent("window_state_change", { state: "focused" });
}

function handleBlur() {
  logEvent("window_state_change", { state: "blurred" });
}

// Attach Event Listeners
// document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("visibilitychange", handleVisibilityChange);
document.addEventListener("copy", handleCopy);
document.addEventListener("paste", handlePaste);
document.addEventListener("cut", handleCut);
window.addEventListener("resize", handleResize);
window.addEventListener("focus", handleFocus);
window.addEventListener("blur", handleBlur);

// Send logs to background script every 5 seconds
setInterval(() => {
  if (logs.length > 0) {
    console.log("📤 Sending logs to background:", logs);
    chrome.runtime.sendMessage({ type: "LOGS", logs }, (response) => {
      console.log("📩 Background response:", response);
    });
    logs = []; // Clear logs after sending
  }
}, 5000);

// Cleanup function to remove event listeners when needed
function removeEventListeners() {
//   document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  document.removeEventListener("copy", handleCopy);
  document.removeEventListener("paste", handlePaste);
  document.removeEventListener("cut", handleCut);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("focus", handleFocus);
  window.removeEventListener("blur", handleBlur);
}
