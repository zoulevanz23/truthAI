// Safety indicator injection for detected suspicious URLs
// This script runs in page context and listens for messages from background script

// Create style element for the safety indicator
const style = document.createElement('style');
style.textContent = `
  .truthcheck-safety-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    background: white;
    border: 2px solid #E2E8F0;
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: inherit;
    max-width: 300px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  .truthcheck-safety-indicator.visible {
    transform: translateX(0);
  }
  .truthcheck-safety-indicator.safe {
    border-color: #059669;
  }
  .truthcheck-safety-indicator.suspicious {
    border-color: #DC2626;
    background: #FEF2F2;
  }
  .truthcheck-safety-indicator .verdict {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 8px;
  }
  .truthcheck-safety-indicator .confidence {
    font-size: 12px;
    color: #64748B;
    margin-bottom: 8px;
  }
  .truthcheck-safety-indicator .signals {
    font-size: 11px;
    color: #9CA3AF;
    line-height: 1.5;
  }
  .truthcheck-safety-indicator.close {
    display: none;
  }
`;

// Inject style into page
(document.head || document.documentElement).style.appendChild(stlet);

// Export for use by other modules
export { style };

// Listen for messages from background script
chrome.runtime.onMessage.addListener(
  async (message: any, sender, sendResponse) => {
    if (message.type === 'update-safety-indicator') {
      const { verdict, confidence, signals } = message;
      const indicator = document.getElementById('truthcheck-safety-indicator');
      
      if (!indicator) {
        // Create indicator if it doesn't exist
        const newIndicator = document.createElement('div');
        newIndicator.id = 'truthcheck-safety-indicator';
        newIndicator.className = 'truthcheck-safety-indicator';
        newIndicator.innerHTML = `
          <div class="verdict">${verdict}</div>
          <div class="confidence">Confidence: ${confidence}%</div>
          <div class="signals">${signals.map((s: string) => '• ' + s).join('<br>')}</div>
          <button class="close-btn" onclick="document.getElementById('truthcheck-safety-indicator').remove()">✕</button>
        `;
        newIndicator.querySelector('.close-btn').style.cssText = `
          margin-left: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: bold;
          color: #64748B;
        `;
        document.body.appendChild(newIndicator);
      }

      // Update indicator
      const ind = document.getElementById('truthcheck-safety-indicator')!;
      ind.className = `truthcheck-safety-indicator ${verdict.toLowerCase()}`;
      ind.querySelector('.verdict').textContent = verdict;
      ind.querySelector('.confidence').textContent = `Confidence: ${confidence}%`;
      ind.querySelector('.signals').innerHTML = signals.map((s: string) => '• ' + s).join('<br>');
      ind.classList.add('visible');
    }

    if (message.type === 'hide-safety-indicator') {
      const indicator = document.getElementById('truthcheck-safety-indicator');
      if (indicator) {
        indicator.classList.remove('visible');
      }
    }
  }
);