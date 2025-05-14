/*
 * PDF.js Worker Stub for version 4.8.69
 * Enhanced version to better handle worker functionality
 */

// Match the exact API version
self.pdfjsWorker = {
  version: "4.8.69",
};

// Worker exports to provide expected functionality
self.GlobalWorkerOptions = {
  workerPort: self,
};

// Minimal worker implementation to handle PDF functionality
const messageHandler = {
  on(eventName, callback) {
    // Store callbacks
    if (!this.callbacks) {
      this.callbacks = {};
    }
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }
    this.callbacks[eventName].push(callback);
  },

  send(action, data) {
    // Simulate worker response
    setTimeout(() => {
      self.postMessage({
        action,
        data: data || {},
      });
    }, 50);
  },
};

console.log("PDF.js enhanced worker stub initialized with version 4.8.69");

// Tell the main thread we're ready
self.postMessage({ isReady: true });

// Handle messages from the main thread
self.onmessage = function (event) {
  // Process any incoming messages
  const data = event.data;

  if (data && data.action) {
    // Echo back to confirm receipt
    self.postMessage({
      action: "response",
      messageId: data.messageId || 0,
      command: data.action,
    });
  }
};
