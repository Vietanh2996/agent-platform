/**
 * Figma Plugin Script: Skills / Browse Library Screen
 * Generated: 2026-04-02
 *
 * This script renders the complete Skills / Browse Library screen on the Figma canvas.
 * Layout: Sidebar (left) + Main Content Area (top-right) + Modal (center)
 */

// Component set keys from DS
const KEYS = {
  sidebarPopoverTrigger: "5c3305b6fa553b99f43236a0e43a8895b216149a",
  sidebarHeaderBtn: "80fe8e5131827a423537d2f8333ca0d722ad5e85",
  sidebarMenuButton: "800b15de9b43c352f2053b53b0ca5198ebef4256",
  sidebarGroupLabel: "edc1265c667eee6d45fd5cccaf305d1bd2e0ac46",
  avatar: "4c4c8c7c48e76c4db623a4583d17f5d4625b0dbb",
  button: "cbd1ecb229351f6dd6bc58462d01c2f360ea7ae1",
  input: "38612ce964f9e7f6d5e7daab2138943c7e102ce2",
};

// Icon keys (Lucide icons mapped to Figma component keys)
const ICON_KEYS = {
  "ChevronsUpDown": "1542892599ed151e42cd3741b9cfc2e9d3841348",
  "PanelLeft": "88b870fefbabe0418b408144fd57700a4a9e25f4",
  "MessageSquare": "c960edd51cc4da789ae4735ae65051d7167d13d0",
  "Inbox": "a5727972e7978e7ba7cb70ad84d5f9f27ae67fce",
  "Zap": "1ed0c53df6f0e88bd66468c47cf3387557f7db52",
  "FileText": "ebbaf5f2940884e7258ec43666554f392809436b",
  "Puzzle": "c05ecbfb998988f02a75be1b0254cb008b956dc5",
  "Bot": "4648832fff6c13915f927e4d1c72c24462e9eaef",
  "BookOpen": "931817e5238277d396bc9fbf19ae1f2fcb4f6e83",
  "Settings": "c576bbad214d71896150fc219570b6410c84f6be",
  "Plus": "72a0d91e271ddc58fb097210a0ca6d37a7300090",
  "Search": "0893b64e645713e1efaee4c51c19cfc3642ef263",
  "ChevronDown": "ed1812afd8960b8bb8eef7a3b4a7a69728ac5f68",
  "LayoutGrid": "5353edf60854d128dfa8210f840ca5ad383a2339",
  "List": "b38984524c1b53071a03dd67eb263c5eff3ecee2",
  "Library": "f86e7085edf53b39c8dc11f0dd47620b26dc8156",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find or create a frame by name (prevents duplicates)
 */
function findOrCreateFrame(name, parent = figma.currentPage) {
  const found = parent.findChild(n => n.type === "FRAME" && n.name === name);
  if (found) return found;
  const f = figma.createFrame();
  f.name = name;
  parent.appendChild(f);
  return f;
}

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

/**
 * Log component properties for debugging
 */
const _loggedKeys = new Set();
function logProps(inst, key) {
  if (_loggedKeys.has(key)) return;
  _loggedKeys.add(key);
  const props = Object.entries(inst.componentProperties || {});
  if (!props.length) {
    console.log(`[${inst.name}] no componentProperties`);
    return;
  }
  console.log(`[${inst.name}]:`);
  props
    .filter(([, v]) => ["TEXT", "INSTANCE_SWAP", "BOOLEAN"].includes(v.type))
    .forEach(([name, val]) => console.log(`  · ${name}: ${val.type} = ${JSON.stringify(val.value)}`));
}

/**
 * Set multiple component properties at once
 */
function setProps(inst, propMap, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [key, value] of Object.entries(propMap)) {
    try {
      inst.setProperties({ [key]: value });
    } catch (e) {
      warnings.push(`setProps "${key}" failed: ${e.message}`);
    }
  }
}

/**
 * Override first TEXT property of an instance
 */
function overrideFirstText(inst, newText, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [name, val] of Object.entries(inst.componentProperties || {})) {
    if (val.type === "TEXT") {
      try {
        inst.setProperties({ [name]: newText });
        return;
      } catch (e) {}
    }
  }
  // Fallback: direct text node
  const nodes = inst.findAll(n => n.type === "TEXT");
  if (nodes[0]) {
    try {
      nodes[0].characters = newText;
      return;
    } catch (e) {}
  }
  warnings.push(`Text override "${newText}" failed on ${inst.name}`);
}

/**
 * Swap icon in instance using icon component
 */
async function swapIcon(inst, swapPropName, iconName, icons, warnings) {
  const comp = icons[iconName];
  if (!comp) {
    warnings.push(`Icon "${iconName}" not imported`);
    return;
  }
  try {
    inst.setProperties({ [swapPropName]: comp.id });
  } catch (e) {
    warnings.push(`Icon swap "${iconName}" failed: ${e.message}`);
  }
}

/**
 * Add component from DS with variant properties
 */
async function addComponent(parent, key, variantProps = {}, warnings = [], { fillWidth = false, wireframeRef = "" } = {}) {
  try {
    const set = await figma.importComponentSetByKeyAsync(key);
    const inst = set.defaultVariant.createInstance();
    if (Object.keys(variantProps).length > 0) {
      inst.setProperties(variantProps);
    }
    parent.appendChild(inst);
    if (fillWidth) {
      inst.layoutSizingHorizontal = "FILL";
    }
    logProps(inst, key);
    return inst;
  } catch (e) {
    console.warn("Import failed:", key.slice(0, 8), e.message);
    warnings.push(`Import failed: ${key.slice(0, 8)}`);
    return addPlaceholder(parent, wireframeRef || key.slice(0, 8));
  }
}

/**
 * Add placeholder frame for missing components
 */
function addPlaceholder(parent, wireframeRef, { width = 228, height = 48 } = {}) {
  const frame = figma.createFrame();
  frame.name = `⏳ ${wireframeRef}`;
  frame.resize(width, height);
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisAlignItems = "CENTER";
  frame.counterAxisAlignItems = "CENTER";
  frame.itemSpacing = 2;
  frame.cornerRadius = 6;
  frame.fills = [{ type: "SOLID", color: { r: 0.96, g: 0.96, b: 0.96 } }];
  frame.strokes = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
  frame.strokeWeight = 1;
  frame.dashPattern = [4, 4];

  const ref = figma.createText();
  ref.characters = wireframeRef;
  ref.fontSize = 10;
  ref.fills = [{ type: "SOLID", color: hexToRgb("#444444") }];
  frame.appendChild(ref);

  const hint = figma.createText();
  hint.characters = "awaiting for design";
  hint.fontSize = 9;
  hint.fills = [{ type: "SOLID", color: hexToRgb("#888888") }];
  frame.appendChild(hint);

  parent.appendChild(frame);
  return frame;
}

/**
 * Create styled text node with text style and color variable
 */
async function styledText(characters, textStyleKey, colorVarKey, warnings = []) {
  const t = figma.createText();
  t.characters = characters;

  try {
    const style = await figma.importStyleByKeyAsync(textStyleKey);
    t.textStyleId = style.id;
  } catch (e) {
    console.warn("Text style import fail:", textStyleKey);
    warnings.push(`Text style import fail: ${textStyleKey}`);
  }

  try {
    const v = await figma.variables.importVariableByKeyAsync(colorVarKey);
    t.fills = [figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      v
    )];
  } catch (e) {
    console.warn("Color var import fail:", colorVarKey);
    warnings.push(`Color var import fail: ${colorVarKey}`);
  }

  return t;
}

/**
 * Render text entry from component-map (type: "text")
 */
async function renderTextEntry(parent, entry, warnings = [], { width = 228, height = 32 } = {}) {
  const frame = figma.createFrame();
  frame.name = entry.label || "Text";
  frame.resize(width, height);
  frame.layoutMode = "HORIZONTAL";
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingLeft = 8;
  frame.paddingRight = 8;
  frame.fills = [];

  const t = await styledText(entry.label, entry.textStyle, entry.colorToken, warnings);
  frame.appendChild(t);
  parent.appendChild(frame);

  return frame;
}

/**
 * Add divider (1px frame)
 */
function addDivider(parent) {
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.layoutMode = "HORIZONTAL";
  divider.primaryAxisSizingMode = "AUTO";
  divider.counterAxisSizingMode = "AUTO";
  divider.resize(4, 1);
  divider.fills = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  parent.appendChild(divider);
  divider.layoutSizingHorizontal = "FILL";
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  // Load fonts
  console.log("Loading fonts...");
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  console.log("✓ Fonts loaded");

  const warnings = [];

  // Pre-import all icons
  console.log("Pre-importing icons...");
  const icons = {};
  for (const [name, key] of Object.entries(ICON_KEYS)) {
    try {
      icons[name] = await figma.importComponentByKeyAsync(key);
    } catch (e) {
      console.warn("Icon import fail:", name, e.message);
      warnings.push(`Icon import fail: ${name}`);
    }
  }
  console.log(`✓ Icons imported (${Object.keys(icons).length})`);

  // ========================================================================
  // PART 1: Create root frame and sidebar
  // ========================================================================

  console.log("Creating root frame and sidebar...");

  const rootFrame = findOrCreateFrame("Skills / Browse Library");
  rootFrame.layoutMode = "HORIZONTAL";
  rootFrame.primaryAxisSizingMode = "FIXED";
  rootFrame.counterAxisSizingMode = "FIXED";
  rootFrame.resize(1440, 900);
  rootFrame.itemSpacing = 0;
  rootFrame.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  rootFrame.clipsContent = true;

  // ========================================================================
  // SIDEBAR (LEFT)
  // ========================================================================
  console.log("Building sidebar...");

  const sidebar = findOrCreateFrame("Sidebar", rootFrame);
  sidebar.layoutMode = "VERTICAL";
  sidebar.primaryAxisSizingMode = "FIXED";
  sidebar.counterAxisSizingMode = "FIXED";
  sidebar.resize(260, 900);
  sidebar.itemSpacing = 0;
  sidebar.paddingLeft = 0;
  sidebar.paddingRight = 0;
  sidebar.paddingTop = 0;
  sidebar.paddingBottom = 0;
  sidebar.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  rootFrame.appendChild(sidebar);

  // Sidebar Header
  const sidebarHeader = findOrCreateFrame("Header", sidebar);
  sidebarHeader.layoutMode = "HORIZONTAL";
  sidebarHeader.primaryAxisSizingMode = "FIXED";
  sidebarHeader.counterAxisSizingMode = "AUTO";
  sidebarHeader.resize(260, 44);
  sidebarHeader.itemSpacing = 0;
  sidebarHeader.paddingLeft = 8;
  sidebarHeader.paddingRight = 4;
  sidebarHeader.paddingTop = 4;
  sidebarHeader.paddingBottom = 4;
  sidebarHeader.fills = [];
  sidebarHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
  sidebarHeader.counterAxisAlignItems = "CENTER";
  sidebar.appendChild(sidebarHeader);

  // App name dropdown (left side of header)
  const appNameTrigger = await addComponent(
    sidebarHeader,
    KEYS.sidebarPopoverTrigger,
    { "State": "Default" },
    warnings,
    { wireframeRef: "App name dropdown" }
  );
  overrideFirstText(appNameTrigger, "Fleet", warnings);
  await swapIcon(appNameTrigger, "Icon#3281:0", "ChevronsUpDown", icons, warnings);

  // Collapse toggle (right side of header)
  const collapseBtn = await addComponent(
    sidebarHeader,
    KEYS.sidebarHeaderBtn,
    { "State": "Default" },
    warnings,
    { wireframeRef: "Collapse toggle" }
  );
  await swapIcon(collapseBtn, "Icon#3281:0", "PanelLeft", icons, warnings);

  // Top nav group
  console.log("  - Adding top nav items...");
  const topNavGroup = findOrCreateFrame("Top Nav", sidebar);
  topNavGroup.layoutMode = "VERTICAL";
  topNavGroup.primaryAxisSizingMode = "AUTO";
  topNavGroup.counterAxisSizingMode = "FIXED";
  topNavGroup.resize(260, 100);
  topNavGroup.itemSpacing = 2;
  topNavGroup.paddingLeft = 8;
  topNavGroup.paddingRight = 8;
  topNavGroup.paddingTop = 8;
  topNavGroup.paddingBottom = 8;
  topNavGroup.fills = [];
  sidebar.appendChild(topNavGroup);

  // Chat nav item
  const chatItem = await addComponent(
    topNavGroup,
    KEYS.sidebarMenuButton,
    { "Type": "Badge", "State": "Default", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Chat nav" }
  );
  overrideFirstText(chatItem, "Chat", warnings);
  await swapIcon(chatItem, "Icon#3281:0", "MessageSquare", icons, warnings);
  setProps(chatItem, { "Badge Text#3278:108": "3" }, warnings);

  // Inbox nav item
  const inboxItem = await addComponent(
    topNavGroup,
    KEYS.sidebarMenuButton,
    { "Type": "Badge", "State": "Default", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Inbox nav" }
  );
  overrideFirstText(inboxItem, "Inbox", warnings);
  await swapIcon(inboxItem, "Icon#3281:0", "Inbox", icons, warnings);
  setProps(inboxItem, { "Badge Text#3278:108": "3" }, warnings);

  // My Agents section
  console.log("  - Adding My Agents section...");
  const agentsLabel = await addComponent(
    sidebar,
    KEYS.sidebarGroupLabel,
    { "Type": "Action", "State": "Default", "Text Size": "sm" },
    warnings,
    { fillWidth: true, wireframeRef: "My Agents label" }
  );
  overrideFirstText(agentsLabel, "My Agents", warnings);
  agentsLabel.layoutSizingHorizontal = "FILL";

  // Empty state text
  const agentsEmptyText = await renderTextEntry(
    sidebar,
    {
      label: "Create an agent to get started",
      textStyle: "18bc7e1f33b627174309265d7e1c046264cf16bf",
      colorToken: "1933717cc251a338091aca27fdfa264aa1b0479a"
    },
    warnings,
    { width: 228, height: 32 }
  );
  agentsEmptyText.paddingLeft = 8;
  agentsEmptyText.paddingRight = 8;
  agentsEmptyText.layoutSizingHorizontal = "FILL";

  // Explore section
  console.log("  - Adding Explore section...");
  const exploreLabel = await addComponent(
    sidebar,
    KEYS.sidebarGroupLabel,
    { "Type": "Default", "State": "Default", "Text Size": "sm" },
    warnings,
    { fillWidth: true, wireframeRef: "Explore label" }
  );
  overrideFirstText(exploreLabel, "Explore", warnings);
  exploreLabel.layoutSizingHorizontal = "FILL";

  // Integrations nav item
  const integrationsItem = await addComponent(
    sidebar,
    KEYS.sidebarMenuButton,
    { "Type": "Simple", "State": "Default", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Integrations nav" }
  );
  overrideFirstText(integrationsItem, "Integrations", warnings);
  await swapIcon(integrationsItem, "Icon#3281:0", "Zap", icons, warnings);
  integrationsItem.layoutSizingHorizontal = "FILL";

  // Skills nav item (ACTIVE state)
  const skillsItem = await addComponent(
    sidebar,
    KEYS.sidebarMenuButton,
    { "Type": "Simple", "State": "Active", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Skills nav" }
  );
  overrideFirstText(skillsItem, "Skills", warnings);
  await swapIcon(skillsItem, "Icon#3281:0", "FileText", icons, warnings);
  skillsItem.layoutSizingHorizontal = "FILL";

  // Templates nav item
  const templatesItem = await addComponent(
    sidebar,
    KEYS.sidebarMenuButton,
    { "Type": "Simple", "State": "Default", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Templates nav" }
  );
  overrideFirstText(templatesItem, "Templates", warnings);
  await swapIcon(templatesItem, "Icon#3281:0", "Puzzle", icons, warnings);
  templatesItem.layoutSizingHorizontal = "FILL";

  // Workspace Agents nav item
  const workspaceAgentsItem = await addComponent(
    sidebar,
    KEYS.sidebarMenuButton,
    { "Type": "Simple", "State": "Default", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Workspace Agents nav" }
  );
  overrideFirstText(workspaceAgentsItem, "Workspace Agents", warnings);
  await swapIcon(workspaceAgentsItem, "Icon#3281:0", "Bot", icons, warnings);
  workspaceAgentsItem.layoutSizingHorizontal = "FILL";

  // Bottom nav section
  console.log("  - Adding bottom nav items...");
  const bottomNavGroup = findOrCreateFrame("Bottom Nav", sidebar);
  bottomNavGroup.layoutMode = "VERTICAL";
  bottomNavGroup.primaryAxisSizingMode = "AUTO";
  bottomNavGroup.counterAxisSizingMode = "FIXED";
  bottomNavGroup.resize(260, 100);
  bottomNavGroup.itemSpacing = 2;
  bottomNavGroup.paddingLeft = 8;
  bottomNavGroup.paddingRight = 8;
  bottomNavGroup.paddingTop = 8;
  bottomNavGroup.paddingBottom = 8;
  bottomNavGroup.fills = [];
  sidebar.appendChild(bottomNavGroup);

  // Documentation nav item
  const docsItem = await addComponent(
    bottomNavGroup,
    KEYS.sidebarMenuButton,
    { "Type": "Simple", "State": "Default", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Documentation nav" }
  );
  overrideFirstText(docsItem, "Documentation", warnings);
  await swapIcon(docsItem, "Icon#3281:0", "BookOpen", icons, warnings);
  docsItem.layoutSizingHorizontal = "FILL";

  // Settings nav item
  const settingsItem = await addComponent(
    bottomNavGroup,
    KEYS.sidebarMenuButton,
    { "Type": "Simple", "State": "Default", "Collapsed": "False" },
    warnings,
    { fillWidth: true, wireframeRef: "Settings nav" }
  );
  overrideFirstText(settingsItem, "Settings", warnings);
  await swapIcon(settingsItem, "Icon#3281:0", "Settings", icons, warnings);
  settingsItem.layoutSizingHorizontal = "FILL";

  // User block (bottom of sidebar)
  console.log("  - Adding user block...");
  const userBlockSpacer = figma.createFrame();
  userBlockSpacer.name = "Spacer";
  userBlockSpacer.layoutMode = "VERTICAL";
  userBlockSpacer.primaryAxisSizingMode = "AUTO";
  userBlockSpacer.counterAxisSizingMode = "FIXED";
  userBlockSpacer.resize(260, 100);
  userBlockSpacer.fills = [];
  sidebar.appendChild(userBlockSpacer);
  userBlockSpacer.layoutSizingVertical = "FILL";

  const userBlock = findOrCreateFrame("User Block", sidebar);
  userBlock.layoutMode = "HORIZONTAL";
  userBlock.primaryAxisSizingMode = "FIXED";
  userBlock.counterAxisSizingMode = "AUTO";
  userBlock.resize(260, 48);
  userBlock.itemSpacing = 8;
  userBlock.paddingLeft = 8;
  userBlock.paddingRight = 8;
  userBlock.paddingTop = 8;
  userBlock.paddingBottom = 8;
  userBlock.fills = [];
  sidebar.appendChild(userBlock);

  // Avatar
  const avatar = await addComponent(
    userBlock,
    KEYS.avatar,
    { "Type": "Fallback", "Size": "6 (24px)" },
    warnings,
    { wireframeRef: "Avatar" }
  );
  overrideFirstText(avatar, "VA", warnings);

  // User email text
  const userEmail = await renderTextEntry(
    userBlock,
    {
      label: "vietanh.ngx29@gmail.com",
      textStyle: "18bc7e1f33b627174309265d7e1c046264cf16bf",
      colorToken: "f73d9ec93a3682484e8af69077eaba20d5406a66"
    },
    warnings,
    { width: 200, height: 24 }
  );

  console.log("✓ Sidebar complete");

  // ========================================================================
  // PART 2: Main content area (right side)
  // ========================================================================

  console.log("Creating main content area...");

  const mainContent = findOrCreateFrame("Main Content", rootFrame);
  mainContent.layoutMode = "VERTICAL";
  mainContent.primaryAxisSizingMode = "AUTO";
  mainContent.counterAxisSizingMode = "FILL";
  mainContent.resize(1180, 900);
  mainContent.itemSpacing = 0;
  mainContent.paddingLeft = 0;
  mainContent.paddingRight = 0;
  mainContent.paddingTop = 0;
  mainContent.paddingBottom = 0;
  mainContent.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  rootFrame.appendChild(mainContent);
  mainContent.layoutSizingHorizontal = "FILL";

  // Page Header
  console.log("  - Building page header...");
  const pageHeader = findOrCreateFrame("Page Header", mainContent);
  pageHeader.layoutMode = "HORIZONTAL";
  pageHeader.primaryAxisSizingMode = "AUTO";
  pageHeader.counterAxisSizingMode = "AUTO";
  pageHeader.itemSpacing = 0;
  pageHeader.paddingLeft = 24;
  pageHeader.paddingRight = 24;
  pageHeader.paddingTop = 24;
  pageHeader.paddingBottom = 0;
  pageHeader.fills = [];
  mainContent.appendChild(pageHeader);
  pageHeader.layoutSizingHorizontal = "FILL";

  // Header left section (icon + title + subtitle)
  const headerLeft = figma.createFrame();
  headerLeft.name = "Left";
  headerLeft.layoutMode = "VERTICAL";
  headerLeft.primaryAxisSizingMode = "AUTO";
  headerLeft.counterAxisSizingMode = "AUTO";
  headerLeft.itemSpacing = 4;
  headerLeft.fills = [];
  pageHeader.appendChild(headerLeft);
  headerLeft.layoutSizingHorizontal = "FILL";

  // Header icon (FileText, small muted)
  const headerIconFrame = figma.createFrame();
  headerIconFrame.name = "Icon";
  headerIconFrame.resize(20, 20);
  headerIconFrame.fills = [];
  headerLeft.appendChild(headerIconFrame);

  // Header title
  const headerTitle = await styledText(
    "Skills",
    "5626b770669ffbf7048f2fc2730c9f5f3cbc900b",
    "aab20ced11a334856ec9331cf98dd2f1637ff70a",
    warnings
  );
  headerTitle.name = "Title";
  headerLeft.appendChild(headerTitle);

  // Header subtitle
  const headerSubtitle = await styledText(
    "Skills shared across all agents in this workspace",
    "18bc7e1f33b627174309265d7e1c046264cf16bf",
    "1933717cc251a338091aca27fdfa264aa1b0479a",
    warnings
  );
  headerSubtitle.name = "Subtitle";
  headerLeft.appendChild(headerSubtitle);

  // Header right section (buttons)
  const headerRight = figma.createFrame();
  headerRight.name = "Right";
  headerRight.layoutMode = "HORIZONTAL";
  headerRight.primaryAxisSizingMode = "AUTO";
  headerRight.counterAxisSizingMode = "AUTO";
  headerRight.itemSpacing = 8;
  headerRight.fills = [];
  pageHeader.appendChild(headerRight);

  // Browse Library button (Outline)
  const browseLibraryBtn = await addComponent(
    headerRight,
    KEYS.button,
    { "Variant": "Outline", "Size": "default", "State": "Default" },
    warnings,
    { wireframeRef: "Browse Library button" }
  );
  overrideFirstText(browseLibraryBtn, "Browse Library", warnings);
  await swapIcon(browseLibraryBtn, "Icon#3281:0", "BookOpen", icons, warnings);

  // Create Skill button (Default/Primary)
  const createSkillBtn = await addComponent(
    headerRight,
    KEYS.button,
    { "Variant": "Default", "Size": "default", "State": "Default" },
    warnings,
    { wireframeRef: "Create Skill button" }
  );
  overrideFirstText(createSkillBtn, "Create Skill", warnings);
  await swapIcon(createSkillBtn, "Icon#3281:0", "Plus", icons, warnings);

  // Content Bar
  console.log("  - Building content bar...");
  const contentBar = findOrCreateFrame("Content Bar", mainContent);
  contentBar.layoutMode = "HORIZONTAL";
  contentBar.primaryAxisSizingMode = "AUTO";
  contentBar.counterAxisSizingMode = "AUTO";
  contentBar.itemSpacing = 16;
  contentBar.paddingLeft = 24;
  contentBar.paddingRight = 24;
  contentBar.paddingTop = 16;
  contentBar.paddingBottom = 16;
  contentBar.fills = [];
  mainContent.appendChild(contentBar);
  contentBar.layoutSizingHorizontal = "FILL";

  // Content bar left
  const contentBarLeft = figma.createFrame();
  contentBarLeft.name = "Left";
  contentBarLeft.layoutMode = "HORIZONTAL";
  contentBarLeft.primaryAxisSizingMode = "AUTO";
  contentBarLeft.counterAxisSizingMode = "AUTO";
  contentBarLeft.itemSpacing = 8;
  contentBarLeft.fills = [];
  contentBar.appendChild(contentBarLeft);

  // Search input
  const searchInput = await addComponent(
    contentBarLeft,
    KEYS.input,
    { "Type": "Default", "Filled": "False", "State": "Default" },
    warnings,
    { wireframeRef: "Search input" }
  );
  searchInput.resize(200, 40);
  searchInput.layoutSizingHorizontal = "FIXED";
  await swapIcon(searchInput, "Icon#3281:0", "Search", icons, warnings);

  // All Skills filter dropdown
  const filterAllBtn = await addComponent(
    contentBarLeft,
    KEYS.button,
    { "Variant": "Outline", "Size": "sm", "State": "Default" },
    warnings,
    { wireframeRef: "All Skills filter" }
  );
  overrideFirstText(filterAllBtn, "All Skills", warnings);
  await swapIcon(filterAllBtn, "Icon#3281:0", "ChevronDown", icons, warnings);

  // Spacer
  const contentBarSpacer = figma.createFrame();
  contentBarSpacer.name = "Spacer";
  contentBarSpacer.layoutMode = "HORIZONTAL";
  contentBarSpacer.primaryAxisSizingMode = "AUTO";
  contentBarSpacer.counterAxisSizingMode = "AUTO";
  contentBarSpacer.resize(100, 1);
  contentBarSpacer.fills = [];
  contentBar.appendChild(contentBarSpacer);
  contentBarSpacer.layoutSizingHorizontal = "FILL";

  // Content bar right
  const contentBarRight = figma.createFrame();
  contentBarRight.name = "Right";
  contentBarRight.layoutMode = "HORIZONTAL";
  contentBarRight.primaryAxisSizingMode = "AUTO";
  contentBarRight.counterAxisSizingMode = "AUTO";
  contentBarRight.itemSpacing = 4;
  contentBarRight.fills = [];
  contentBar.appendChild(contentBarRight);

  // Grid view toggle
  const gridViewBtn = await addComponent(
    contentBarRight,
    KEYS.button,
    { "Variant": "Ghost", "Size": "icon-sm", "State": "Default" },
    warnings,
    { wireframeRef: "Grid view toggle" }
  );
  await swapIcon(gridViewBtn, "Icon#3281:0", "LayoutGrid", icons, warnings);

  // List view toggle
  const listViewBtn = await addComponent(
    contentBarRight,
    KEYS.button,
    { "Variant": "Ghost", "Size": "icon-sm", "State": "Default" },
    warnings,
    { wireframeRef: "List view toggle" }
  );
  await swapIcon(listViewBtn, "Icon#3281:0", "List", icons, warnings);

  // Skills List Area (empty state)
  console.log("  - Adding skills list area...");
  const skillsList = findOrCreateFrame("Skills List", mainContent);
  skillsList.layoutMode = "VERTICAL";
  skillsList.primaryAxisSizingMode = "AUTO";
  skillsList.counterAxisSizingMode = "FILL";
  skillsList.resize(1180, 600);
  skillsList.fills = [{ type: "SOLID", color: hexToRgb("#fafafa") }];
  mainContent.appendChild(skillsList);
  skillsList.layoutSizingHorizontal = "FILL";
  skillsList.layoutSizingVertical = "FILL";

  const emptyStateText = figma.createText();
  emptyStateText.characters = "No skills yet";
  emptyStateText.fontSize = 14;
  emptyStateText.fills = [{ type: "SOLID", color: hexToRgb("#666666") }];
  skillsList.appendChild(emptyStateText);

  console.log("✓ Main content area complete");

  // ========================================================================
  // PART 3: Skill Library Modal
  // ========================================================================

  console.log("Creating modal...");

  const modal = findOrCreateFrame("Skill Library Modal", rootFrame);
  modal.layoutMode = "VERTICAL";
  modal.primaryAxisSizingMode = "FIXED";
  modal.counterAxisSizingMode = "FIXED";
  modal.resize(700, 560);
  modal.itemSpacing = 0;
  modal.paddingLeft = 0;
  modal.paddingRight = 0;
  modal.paddingTop = 0;
  modal.paddingBottom = 0;
  modal.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  modal.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  modal.strokeWeight = 1;
  modal.cornerRadius = 8;
  rootFrame.appendChild(modal);

  // Position modal at center
  modal.x = (1440 - 700) / 2;
  modal.y = (900 - 560) / 2;

  // Modal Header
  console.log("  - Building modal header...");
  const modalHeader = findOrCreateFrame("Header", modal);
  modalHeader.layoutMode = "VERTICAL";
  modalHeader.primaryAxisSizingMode = "AUTO";
  modalHeader.counterAxisSizingMode = "AUTO";
  modalHeader.itemSpacing = 2;
  modalHeader.paddingLeft = 24;
  modalHeader.paddingRight = 24;
  modalHeader.paddingTop = 20;
  modalHeader.paddingBottom = 16;
  modalHeader.fills = [];
  modal.appendChild(modalHeader);
  modalHeader.layoutSizingHorizontal = "FILL";

  // Modal header icon + title row
  const modalTitleRow = figma.createFrame();
  modalTitleRow.name = "Title Row";
  modalTitleRow.layoutMode = "HORIZONTAL";
  modalTitleRow.primaryAxisSizingMode = "AUTO";
  modalTitleRow.counterAxisSizingMode = "AUTO";
  modalTitleRow.itemSpacing = 8;
  modalTitleRow.fills = [];
  modalHeader.appendChild(modalTitleRow);

  // Modal icon
  const modalIconFrame = figma.createFrame();
  modalIconFrame.name = "Icon";
  modalIconFrame.resize(20, 20);
  modalIconFrame.fills = [];
  modalTitleRow.appendChild(modalIconFrame);

  // Modal title
  const modalTitle = await styledText(
    "Skill Library",
    "5626b770669ffbf7048f2fc2730c9f5f3cbc900b",
    "aab20ced11a334856ec9331cf98dd2f1637ff70a",
    warnings
  );
  modalTitle.name = "Title";
  modalTitleRow.appendChild(modalTitle);

  // Modal subtitle
  const modalSubtitle = await styledText(
    "Browse pre-built skills",
    "18bc7e1f33b627174309265d7e1c046264cf16bf",
    "1933717cc251a338091aca27fdfa264aa1b0479a",
    warnings
  );
  modalSubtitle.name = "Subtitle";
  modalHeader.appendChild(modalSubtitle);

  // Modal divider
  addDivider(modal);

  // Modal content (2-column layout)
  console.log("  - Building modal content...");
  const modalContent = findOrCreateFrame("Content", modal);
  modalContent.layoutMode = "HORIZONTAL";
  modalContent.primaryAxisSizingMode = "AUTO";
  modalContent.counterAxisSizingMode = "FILL";
  modalContent.itemSpacing = 0;
  modalContent.paddingLeft = 0;
  modalContent.paddingRight = 0;
  modalContent.paddingTop = 0;
  modalContent.paddingBottom = 0;
  modalContent.fills = [];
  modal.appendChild(modalContent);
  modalContent.layoutSizingHorizontal = "FILL";
  modalContent.layoutSizingVertical = "FILL";

  // Left panel (search + filters)
  const leftPanel = findOrCreateFrame("Left Panel", modalContent);
  leftPanel.layoutMode = "VERTICAL";
  leftPanel.primaryAxisSizingMode = "FIXED";
  leftPanel.counterAxisSizingMode = "FILL";
  leftPanel.resize(200, 500);
  leftPanel.itemSpacing = 12;
  leftPanel.paddingLeft = 16;
  leftPanel.paddingRight = 8;
  leftPanel.paddingTop = 16;
  leftPanel.paddingBottom = 16;
  leftPanel.fills = [{ type: "SOLID", color: hexToRgb("#fafafa") }];
  modalContent.appendChild(leftPanel);

  // Left panel search
  const leftSearch = await addComponent(
    leftPanel,
    KEYS.input,
    { "Type": "Default", "Filled": "False", "State": "Default" },
    warnings,
    { fillWidth: true, wireframeRef: "Modal search" }
  );
  leftSearch.resize(200, 40);
  leftSearch.layoutSizingHorizontal = "FILL";
  await swapIcon(leftSearch, "Icon#3281:0", "Search", icons, warnings);

  // "All" filter pill
  const allFilterPill = await addComponent(
    leftPanel,
    KEYS.button,
    { "Variant": "Secondary", "Size": "sm", "State": "Default" },
    warnings,
    { fillWidth: true, wireframeRef: "All filter" }
  );
  overrideFirstText(allFilterPill, "All", warnings);
  allFilterPill.layoutSizingHorizontal = "FILL";

  // Categories label
  const categoriesLabel = await styledText(
    "CATEGORIES",
    "845e2807d7bd156cd78a7dc1a9d57c3ae578e309",
    "1933717cc251a338091aca27fdfa264aa1b0479a",
    warnings
  );
  categoriesLabel.name = "Categories Label";
  leftPanel.appendChild(categoriesLabel);

  // Category items
  const categories = ["Research", "Sales", "Productivity", "Marketing", "Product"];
  for (const category of categories) {
    const categoryBtn = await addComponent(
      leftPanel,
      KEYS.button,
      { "Variant": "Ghost", "Size": "sm", "State": "Default" },
      warnings,
      { fillWidth: true, wireframeRef: `Category: ${category}` }
    );
    overrideFirstText(categoryBtn, category, warnings);
    categoryBtn.layoutSizingHorizontal = "FILL";
  }

  // Right panel (skill cards grid)
  const rightPanel = findOrCreateFrame("Right Panel", modalContent);
  rightPanel.layoutMode = "VERTICAL";
  rightPanel.primaryAxisSizingMode = "AUTO";
  rightPanel.counterAxisSizingMode = "FILL";
  rightPanel.resize(500, 500);
  rightPanel.itemSpacing = 12;
  rightPanel.paddingLeft = 16;
  rightPanel.paddingRight = 16;
  rightPanel.paddingTop = 16;
  rightPanel.paddingBottom = 16;
  rightPanel.fills = [];
  modalContent.appendChild(rightPanel);
  rightPanel.layoutSizingHorizontal = "FILL";

  // Skill cards (3-column grid)
  const skillCards = [
    { title: "Deep Research", desc: "Conduct deep research on any topic" },
    { title: "Account Briefing", desc: "Generate account briefing documents" },
    { title: "Email Triage", desc: "Automatically triage incoming emails" },
    { title: "Marketing Psychology", desc: "Apply psychology principles to marketing" },
    { title: "Copywriting", desc: "Write persuasive copy for campaigns" },
    { title: "Cold Email", desc: "Generate cold email templates" },
    { title: "SEO Audit", desc: "Audit website SEO performance" },
    { title: "Content Strategy", desc: "Develop content strategy plans" },
    { title: "Social Content", desc: "Create social media content" },
    { title: "Competitive Analysis", desc: "Analyze competitor strategies" },
    { title: "Defining Product Vision", desc: "Define clear product vision" },
    { title: "Writing PRDs", desc: "Write product requirement documents" },
  ];

  const cardsContainer = figma.createFrame();
  cardsContainer.name = "Cards Container";
  cardsContainer.layoutMode = "VERTICAL";
  cardsContainer.primaryAxisSizingMode = "AUTO";
  cardsContainer.counterAxisSizingMode = "AUTO";
  cardsContainer.itemSpacing = 12;
  cardsContainer.fills = [];
  rightPanel.appendChild(cardsContainer);
  cardsContainer.layoutSizingHorizontal = "FILL";

  // Create 3-column grid of cards
  let cardRow = null;
  for (let i = 0; i < skillCards.length; i++) {
    if (i % 3 === 0) {
      cardRow = figma.createFrame();
      cardRow.name = `Row ${Math.floor(i / 3)}`;
      cardRow.layoutMode = "HORIZONTAL";
      cardRow.primaryAxisSizingMode = "AUTO";
      cardRow.counterAxisSizingMode = "AUTO";
      cardRow.itemSpacing = 12;
      cardRow.fills = [];
      cardsContainer.appendChild(cardRow);
      cardRow.layoutSizingHorizontal = "FILL";
    }

    const card = figma.createFrame();
    card.name = skillCards[i].title;
    card.layoutMode = "VERTICAL";
    card.primaryAxisSizingMode = "FIXED";
    card.counterAxisSizingMode = "AUTO";
    card.itemSpacing = 8;
    card.paddingLeft = 12;
    card.paddingRight = 12;
    card.paddingTop = 12;
    card.paddingBottom = 12;
    card.resize(140, 120);
    card.cornerRadius = 6;
    card.fills = [{ type: "SOLID", color: hexToRgb("#f5f5f5") }];
    card.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
    card.strokeWeight = 1;
    cardRow.appendChild(card);

    // Card icon (FileText, small, muted)
    const cardIcon = figma.createFrame();
    cardIcon.name = "Icon";
    cardIcon.resize(16, 16);
    cardIcon.fills = [];
    card.appendChild(cardIcon);

    // Card title
    const cardTitle = figma.createText();
    cardTitle.characters = skillCards[i].title;
    cardTitle.fontSize = 12;
    cardTitle.fontWeight = 500;
    cardTitle.fills = [{ type: "SOLID", color: hexToRgb("#000000") }];
    card.appendChild(cardTitle);

    // Card description
    const cardDesc = figma.createText();
    cardDesc.characters = skillCards[i].desc;
    cardDesc.fontSize = 11;
    cardDesc.fills = [{ type: "SOLID", color: hexToRgb("#666666") }];
    cardDesc.textTruncate = "WORD_BOUNDARY";
    card.appendChild(cardDesc);
  }

  console.log("✓ Modal complete");

  // ========================================================================
  // FINALIZATION
  // ========================================================================

  console.log("Finalizing...");
  figma.viewport.scrollAndZoomIntoView([rootFrame]);

  // Log warnings
  const message = warnings.length > 0
    ? `Done. ${warnings.length} warnings — check console.`
    : "Done!";
  figma.notify(message);

  if (warnings.length > 0) {
    console.warn("\n=== WARNINGS ===");
    warnings.forEach(w => console.warn(`- ${w}`));
  }

  console.log("\n✓ Script completed successfully");
}

main().catch(console.error);
