const app = document.querySelector('#app');

const state = {
  archive: null,
  selectedPath: null,
  query: '',
};

function ensureNode(node, path) {
  if (!node) return null;
  if (path === node.path) return node;

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const match = ensureNode(child, path);
      if (match) return match;
    }
  }

  return null;
}

function flattenTree(node, entries = []) {
  entries.push(node);

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      flattenTree(child, entries);
    }
  }

  return entries;
}

function getVisibleNodes(root) {
  const entries = flattenTree(root);
  const query = state.query.trim().toLowerCase();

  if (!query) return entries;

  return entries.filter((entry) => {
    const haystack = `${entry.name} ${entry.type} ${entry.path}`.toLowerCase();
    return haystack.includes(query);
  });
}

function createTreeNode(node, depth = 0) {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'tree-node';
  item.dataset.path = node.path;
  item.style.setProperty('--depth', depth);

  const isSelected = state.selectedPath === node.path;
  if (isSelected) item.classList.add('selected');

  const icon = node.type === 'directory' ? '📁' : '📄';
  const label = document.createElement('span');
  label.textContent = `${icon} ${node.name}`;
  item.appendChild(label);

  item.addEventListener('click', () => {
    state.selectedPath = node.path;
    render();
  });

  return item;
}

function renderTree(root) {
  const tree = document.querySelector('#tree');
  tree.innerHTML = '';
  const visible = getVisibleNodes(root);

  visible.forEach((entry) => {
    const node = createTreeNode(entry, findDepth(root, entry.path, 0));
    tree.appendChild(node);
  });
}

function findDepth(root, targetPath, currentDepth = 0) {
  if (root.path === targetPath) return currentDepth;

  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      const depth = findDepth(child, targetPath, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }

  return -1;
}

function renderSummary(root) {
  const entries = flattenTree(root);
  const files = entries.filter((entry) => entry.type !== 'directory').length;
  const directories = entries.filter((entry) => entry.type === 'directory').length;

  const summary = document.querySelector('#summary');
  summary.innerHTML = `
    <div class="stat-card"><strong>${entries.length}</strong><span>items</span></div>
    <div class="stat-card"><strong>${directories}</strong><span>folders</span></div>
    <div class="stat-card"><strong>${files}</strong><span>files</span></div>
  `;
}

function renderDetails(node) {
  if (!node) {
    document.querySelector('#details').innerHTML = '<p>Select an item to inspect metadata.</p>';
    return;
  }

  const details = document.querySelector('#details');
  const metadata = node.metadata ?? {};

  const entries = Object.entries({
    Name: node.name,
    Path: node.path,
    Type: node.type,
    Size: node.size ?? 'n/a',
    SHA256: node.hash ?? 'n/a',
    'Bundle ID': metadata.bundleId ?? 'n/a',
    'CFBundleName': metadata.bundleName ?? 'n/a',
    'Short Version': metadata.shortVersion ?? 'n/a',
    'Version': metadata.version ?? 'n/a',
    'Source': metadata.source ?? 'example-ipa-archive',
  });

  const rows = entries
    .map(
      ([label, value]) => `
        <div class="meta-row">
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `,
    )
    .join('');

  details.innerHTML = `
    <div class="details-header">
      <div class="badge">${node.type === 'directory' ? 'Directory' : 'File'}</div>
      <h2>${node.name}</h2>
    </div>
    <dl class="meta-list">${rows}</dl>
  `;
}

function render() {
  const root = state.archive.root;
  renderSummary(root);
  renderTree(root);

  let activeNode = state.archive.root;
  if (state.selectedPath) {
    activeNode = ensureNode(root, state.selectedPath) ?? root;
  }

  state.selectedPath = activeNode.path;
  renderDetails(activeNode);
}

async function boot() {
  const response = await fetch('/data/archive.json');
  const payload = await response.json();
  state.archive = payload;
  state.selectedPath = payload.root.path;
  render();

  const searchInput = document.querySelector('#search');
  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderTree(state.archive.root);
  });
}

app.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar">
      <div class="header-block">
        <p class="eyebrow">IPA archive</p>
        <h1>SoundTouch</h1>
      </div>

      <label class="search-box" for="search">
        <span>Search</span>
        <input id="search" type="search" placeholder="Filter archive items" />
      </label>

      <div id="summary" class="summary"></div>
      <div id="tree" class="tree" aria-label="Archive tree"></div>
    </aside>

    <main class="content-panel">
      <div id="details" class="details"></div>
    </main>
  </div>
`;

boot();
