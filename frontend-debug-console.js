// Frontend Form Debugging Console
// Add this to browser developer console to monitor form submissions

// 1. Override fetch to log all API calls
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  console.log('🔄 FETCH REQUEST:', {
    url: url,
    method: options?.method || 'GET',
    headers: options?.headers,
    body: options?.body ? JSON.parse(options.body) : null
  });
  
  return originalFetch.apply(this, arguments)
    .then(response => {
      console.log('📊 FETCH RESPONSE:', {
        url: url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      clonedResponse.json().then(data => {
        console.log('📋 RESPONSE DATA:', data);
      }).catch(() => {
        clonedResponse.text().then(text => {
          console.log('📋 RESPONSE TEXT:', text);
        }).catch(() => {
          console.log('📋 RESPONSE: Could not read response body');
        });
      });
      
      return response;
    })
    .catch(error => {
      console.log('❌ FETCH ERROR:', {
        url: url,
        error: error.message
      });
      throw error;
    });
};

// 2. Monitor form submissions
document.addEventListener('submit', function(event) {
  console.log('📝 FORM SUBMITTED:', {
    form: event.target,
    action: event.target.action,
    method: event.target.method,
    data: new FormData(event.target)
  });
});

// 3. Monitor button clicks
document.addEventListener('click', function(event) {
  if (event.target.type === 'submit' || event.target.tagName === 'BUTTON') {
    console.log('🖱️  BUTTON CLICKED:', {
      button: event.target,
      text: event.target.textContent,
      type: event.target.type,
      disabled: event.target.disabled
    });
  }
});

// 4. Monitor React state changes (if available)
if (window.React) {
  console.log('⚛️  React detected - monitoring state changes');
}

// 5. Monitor localStorage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  console.log('💾 LOCALSTORAGE SET:', { key, value });
  return originalSetItem.apply(this, arguments);
};

console.log('🐛 Frontend Debug Console Active');
console.log('📋 Available debug commands:');
console.log('  - All fetch requests will be logged');
console.log('  - All form submissions will be logged');
console.log('  - All button clicks will be logged');
console.log('  - LocalStorage changes will be logged');
console.log('');
console.log('💡 Try creating a member, event, or campaign to see detailed logs');
