const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const dirs = ['3d-engine', 'ui-system', 'safety-system'];
dirs.forEach(dir => {
  const p = path.join(srcDir, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p);
});

// Define mapping of file -> new directory
const moves = {
  'components/Scene3D.jsx': '3d-engine/Scene3D.jsx',
  'components/Map3D.jsx': '3d-engine/Map3D.jsx',
  'components/ThreeDView.jsx': '3d-engine/ThreeDView.jsx',
  'components/MapLibre3D.jsx': '3d-engine/MapLibre3D.jsx',

  'components/SearchBar.jsx': 'ui-system/SearchBar.jsx',
  'components/SearchBox.jsx': 'ui-system/SearchBox.jsx',
  'components/Sidebar.jsx': 'ui-system/Sidebar.jsx',
  'components/ToggleMode.jsx': 'ui-system/ToggleMode.jsx',
  'components/RoutePanel.jsx': 'ui-system/RoutePanel.jsx',
  'components/Map2D.jsx': 'ui-system/Map2D.jsx',
  'components/MapView.jsx': 'ui-system/MapView.jsx',
  'components/LeafletMap.jsx': 'ui-system/LeafletMap.jsx',
  
  'components/SOSPanel.jsx': 'safety-system/SOSPanel.jsx',
  'components/AlertBox.jsx': 'safety-system/AlertBox.jsx',
  'components/ChatBox.jsx': 'safety-system/ChatBox.jsx',
  'components/NotificationSystem.jsx': 'safety-system/NotificationSystem.jsx',
  'components/SafetyIndicator.jsx': 'safety-system/SafetyIndicator.jsx',
  
  'pages/Dashboard.jsx': 'ui-system/Dashboard.jsx',
  'components/SplashScreen.jsx': 'ui-system/SplashScreen.jsx'
};

// Perform moves
for (const [oldPath, newPath] of Object.entries(moves)) {
  const fullOld = path.join(srcDir, oldPath);
  const fullNew = path.join(srcDir, newPath);
  if (fs.existsSync(fullOld)) {
    fs.renameSync(fullOld, fullNew);
  }
}

// Update imports
const replaceInFile = (filePath, fileMap) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [oldPath, newPath] of Object.entries(fileMap)) {
    // Determine relative paths... Actually simpler: just replace commonly used import patterns
    // e.g., '../components/Scene3D' -> '../3d-engine/Scene3D' or '../../3d-engine/Scene3D' depending on current dir
    
    const baseOld = path.basename(oldPath, '.jsx');
    const baseNew = path.basename(newPath, '.jsx');
    
    // Naive replace: we just search for standard imports.
    // E.g. in Dashboard.jsx (now in ui-system), importing ../components/SearchBar
    // Since everything was in components or pages, and now they are in 3d-engine, ui-system, safety-system.
  }
};

// Instead of complex relative path tracking, we can just replace string patterns in all .jsx files.
const allFiles = [];
const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.jsx') || p.endsWith('.js')) allFiles.push(p);
  }
};
walk(srcDir);

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Extremely basic heuristic replacing for this specific app
  const replacements = [
    { from: /'(\.\/|\.\.\/)+components\/Scene3D'/g, to: "'../3d-engine/Scene3D'" },
    { from: /'(\.\/|\.\.\/)+components\/SearchBar'/g, to: "'../ui-system/SearchBar'" },
    { from: /'(\.\/|\.\.\/)+components\/Map2D'/g, to: "'../ui-system/Map2D'" },
    { from: /'(\.\/|\.\.\/)+components\/ChatBox'/g, to: "'../safety-system/ChatBox'" },
    { from: /'(\.\/|\.\.\/)+components\/NotificationSystem'/g, to: "'../safety-system/NotificationSystem'" },
    { from: /'(\.\/|\.\.\/)+components\/SOSPanel'/g, to: "'../safety-system/SOSPanel'" },
    { from: /'(\.\/|\.\.\/)+pages\/Dashboard'/g, to: "'../ui-system/Dashboard'" },
    { from: /'\.\.\/components\//g, to: "'../ui-system/" }, // fallback
    { from: /'\.\/components\//g, to: "'./ui-system/" }, // fallback
  ];

  for (const r of replacements) {
    if (r.from.test(content)) {
      content = content.replace(r.from, r.to);
      changed = true;
    }
  }

  // Also fix imports in Dashboard itself since it moved from pages to ui-system (1 depth to 1 depth, relative paths might be same for context/services)
  if (file.includes('Dashboard.jsx')) {
    content = content.replace(/'\.\.\/ui-system\//g, "'./"); // Since it's IN ui-system now
    content = content.replace(/'\.\.\/safety-system\//g, "'../safety-system/");
    content = content.replace(/'\.\.\/3d-engine\//g, "'../3d-engine/");
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
}

console.log('Migration complete');
