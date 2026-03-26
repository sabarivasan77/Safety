const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE: ${msg.type().toUpperCase()} ${msg.text()}`);
    if (msg.type() === 'error') {
      console.log('--- ERROR STACK ---');
      console.log(msg.location());
    }
  });

  page.on('pageerror', error => {
    console.log(`BROWSER RUNTIME ERROR: ${error.message}`);
    console.log(error.stack);
  });

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    const content = await page.content();
    console.log('--- PAGE DOM (Root child count) ---');
    const rootChildren = await page.evaluate(() => document.getElementById('root')?.children.length || 0);
    console.log(`Root has ${rootChildren} children.`);
    
    if (rootChildren === 0) {
      console.log('Application is BLANK.');
    } else {
      console.log('Application has rendered something.');
    }

    await page.screenshot({ path: '/tmp/ui_test_debug.png' });
    console.log('Screenshot saved to /tmp/ui_test_debug.png');

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
})();
