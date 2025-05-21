/**
 * AdButler Debug Utilities
 * 
 * This file contains shared functionality for debugging AdButler ad integration
 * across different pages in the MediMobile demo application.
 */

// Turn on AdButler debug mode
window.adb_debug = true;

/**
 * Enhanced logging function with UI output
 * Logs messages to console, UI debug panel, and optionally to server
 * @param {string} message - The message to log
 */
function logToTerminal(message) {
  console.log(message);
  
  // Add to debug panel if it exists
  const debugLog = document.getElementById('debug-log');
  if (debugLog) {
    const logLine = document.createElement('div');
    logLine.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    debugLog.appendChild(logLine);
    
    // Auto-scroll to bottom of debug panel
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.scrollTop = debugPanel.scrollHeight;
    }
  }
  
  // Also send to server if needed
  fetch('/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ log: message })
  }).catch(err => console.error('Failed to log to terminal:', err));
}

/**
 * Initialize debug panel in the given container
 * @param {string} containerId - The ID of the container to add the debug panel to
 */
function initDebugPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const debugPanel = document.createElement('div');
  debugPanel.id = 'debug-panel';
  debugPanel.style.marginTop = '20px';
  debugPanel.style.textAlign = 'left';
  debugPanel.style.fontSize = '12px';
  debugPanel.style.padding = '10px';
  debugPanel.style.background = '#f8f8f8';
  debugPanel.style.border = '1px solid #ddd';
  debugPanel.style.maxHeight = '200px';
  debugPanel.style.overflowY = 'auto';
  
  const heading = document.createElement('h4');
  heading.textContent = 'AdButler Debug Info:';
  
  const debugLog = document.createElement('div');
  debugLog.id = 'debug-log';
  
  debugPanel.appendChild(heading);
  debugPanel.appendChild(debugLog);
  container.appendChild(debugPanel);
  
  logToTerminal('Debug panel initialized');
}

/**
 * Setup network request monitoring for AdButler
 */
function monitorAdButlerNetwork() {
  if (window._adButlerMonitoringActive) return;
  
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (url.includes('adbutler') || url.includes('servedbyadbutler')) {
      logToTerminal(`AdButler network request: ${url}`);
    }
    return originalFetch.apply(this, arguments);
  };
  
  window._adButlerMonitoringActive = true;
  logToTerminal('AdButler network monitoring activated');
}

/**
 * Load AdButler script and set up ad loading
 * @param {number} zoneId - The AdButler zone ID
 * @param {string} adContainerId - The HTML element ID where the ad should be placed
 * @param {Object} dataKeyObj - The data keys to target ads
 * @param {Array} dimensions - Ad dimensions as [width, height]
 */
function loadAdButlerAd(zoneId, adContainerId, dataKeyObj, dimensions = [300, 250]) {
  const adContainer = document.getElementById(adContainerId);
  if (!adContainer) {
    logToTerminal(`ERROR: Ad container ${adContainerId} not found`);
    return;
  }
  
  // Save data keys to window for access in other contexts
  window.dataKeys = dataKeyObj;
  logToTerminal(`Setting data key: ${JSON.stringify(dataKeyObj)}`);
  
  // Initialize AdButler objects
  var AdButler = window.AdButler || {};
  AdButler.ads = AdButler.ads || [];
  var abkw = window.abkw || '';
  var plcId = window['plc' + zoneId] || 0;
  window['plc' + zoneId] = plcId;
  
  // Create a script element to load AdButler
  const script = document.createElement('script');
  script.async = true;
  script.type = "text/javascript";
  script.src = 'https://servedbyadbutler.com/app.js';
  
  script.onload = function() {
    logToTerminal('AdButler app.js script loaded successfully');
    
    // Push the ad request AFTER the script is loaded
    AdButler.ads.push({
      handler: function(opt) {
        logToTerminal('AdButler handler function called');
        
        // Set the data keys in the opt parameter
        opt.dataKeys = dataKeyObj;
        logToTerminal(`Data keys being sent: ${JSON.stringify(opt.dataKeys)}`);
        
        // Register the ad
        AdButler.register(188651, zoneId, dimensions, adContainerId, opt);
        logToTerminal(`AdButler.register called with zoneId: ${zoneId}`);
      },
      opt: {
        place: plcId++,
        keywords: abkw,
        domain: 'servedbyadbutler.com',
        click: 'CLICK_MACRO_PLACEHOLDER',
        // Also include data keys in the initial opt
        dataKeys: dataKeyObj
      }
    });
  };
  
  script.onerror = function() {
    logToTerminal('ERROR: Failed to load AdButler app.js script');
  };
  
  // Add script to document to start loading
  logToTerminal(`Loading AdButler app.js script for zone ${zoneId}`);
  document.head.appendChild(script);
  
  // Set a timeout to check if the ad loaded
  setTimeout(() => {
    if (adContainer.textContent.includes('Loading')) {
      logToTerminal('WARNING: AdButler did not respond within 5 seconds');
      logToTerminal('Checking if ad div was modified by AdButler...');
      // Check if AdButler created any elements
      if (adContainer.children.length === 0) {
        logToTerminal('No child elements found - AdButler did not modify the ad container');
      } else {
        logToTerminal(`Found ${adContainer.children.length} child elements in ad container`);
      }
    } else {
      logToTerminal('Ad appears to have loaded successfully!');
    }
  }, 5000);
}

/**
 * Clear any existing AdButler scripts
 * Useful when reloading ads on the same page
 */
function clearAdButlerScripts() {
  const existingScripts = document.querySelectorAll('script[src*="servedbyadbutler.com"]');
  existingScripts.forEach(script => script.remove());
  logToTerminal('Cleared existing AdButler scripts');
}