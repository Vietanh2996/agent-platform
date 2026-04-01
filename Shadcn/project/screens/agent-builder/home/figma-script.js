// Agent Builder — Home Screen
// Figma Plugin Script — paste vào Scripter và Run
// DS: shadcn/ui | File: LiAE855pzu8Abe1z0BokO7

console.log("** TOP LEVEL — script parsed OK");
// ── Component set keys (ds-keys.json) ────────────────────────────
const KEYS = {
  sidebarPopoverTrigger: "5c3305b6fa553b99f43236a0e43a8895b216149a",
  sidebarHeaderBtn:      "80fe8e5131827a423537d2f8333ca0d722ad5e85",
  sidebarMenuButton:     "800b15de9b43c352f2053b53b0ca5198ebef4256",
  sidebarGroupLabel:     "edc1265c667eee6d45fd5cccaf305d1bd2e0ac46",
  avatar:                "4c4c8c7c48e76c4db623a4583d17f5d4625b0dbb",
  button:                "cbd1ecb229351f6dd6bc58462d01c2f360ea7ae1",
  textarea:              "7fded121e55260531648b06bb96eec8da63d956f",
};

// ── Icon keys (ds-icon-keys.json) ────────────────────────────────
const ICON_KEYS = {
  MessageSquare: "c960edd51cc4da789ae4735ae65051d7167d13d0",
  Inbox:         "a5727972e7978e7ba7cb70ad84d5f9f27ae67fce",
  Zap:           "1ed0c53df6f0e88bd66468c47cf3387557f7db52",
  FileText:      "ebbaf5f2940884e7258ec43666554f392809436b",
  Puzzle:        "c05ecbfb998988f02a75be1b0254cb008b956dc5",
  Bot:           "4648832fff6c13915f927e4d1c72c24462e9eaef",
  BookOpen:      "931817e5238277d396bc9fbf19ae1f2fcb4f6e83",
  Settings:      "c576bbad214d71896150fc219570b6410c84f6be",
  Plus:          "72a0d91e271ddc58fb097210a0ca6d37a7300090",
  Mic:           "a626253f069d114c3968086cab4f4f306a7f2df6",
  ArrowUp:       "6e2916eb915b959ab016afe7817f10f3cb3e6c45",
  ChevronDown:   "ed1812afd8960b8bb8eef7a3b4a7a69728ac5f68",
};

// ── DS token keys (component-map.json) ───────────────────────────
const TEXT_STYLES = {
  smNormal:   "18bc7e1f33b627174309265d7e1c046264cf16bf", // text-sm/leading-normal/normal
  xlSemibold: "144b63084c8a3d11f60b04ec2d2279276b8044a7", // text-xl/leading-normal/semibold
};
const COLOR_VARS = {
  foreground:        "aab20ced11a334856ec9331cf98dd2f1637ff70a",
  mutedForeground:   "1933717cc251a338091aca27fdfa264aa1b0479a",
  sidebarForeground: "f73d9ec93a3682484e8af69077eaba20d5406a66",
};

// ── Nav config ────────────────────────────────────────────────────
const NAV_MAIN = [
  { label: "Chat",  icon: "MessageSquare", badge: "3", state: "Default" },
  { label: "Inbox", icon: "Inbox",         badge: "3", state: "Active"  },
];
const NAV_EXPLORE = [
  { label: "Integrations",     icon: "Zap"      },
  { label: "Skills",           icon: "FileText" },
  { label: "Templates",        icon: "Puzzle"   },
  { label: "Workspace Agents", icon: "Bot"      },
];
const NAV_BOTTOM = [
  { label: "Documentation", icon: "BookOpen" },
  { label: "Settings",      icon: "Settings" },
];

// ── Component property names (discovered via logProps) ────────────
// SidebarMenuButton: Text#3278:82, Badge Text#3278:108, Icon Name#3278:95, Icon#3281:0
// SidebarGroupLabel: Label#3278:69
// (logProps sẽ log thêm nếu cần)

async function main() {
  console.log("**  1: start");
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  console.log("**  2: fonts loaded");

  const warnings = [];

  // Pre-import icons
  const icons = {};
  for (const [name, key] of Object.entries(ICON_KEYS)) {
    try { icons[name] = await figma.importComponentByKeyAsync(key); }
    catch (e) { console.warn("Icon import fail:", name); }
  }
  console.log("**  3: icons loaded");

  // ── Root frame ─────────────────────────────────────────────────
  const root = figma.createFrame();
  root.name = "Agent Builder / Home";
  root.resize(1440, 900);
  root.layoutMode = "HORIZONTAL";
  root.itemSpacing = 0;
  root.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  root.clipsContent = true;
  figma.currentPage.appendChild(root);

  // ── SIDEBAR ────────────────────────────────────────────────────
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar";
  sidebar.layoutMode = "VERTICAL";
  sidebar.primaryAxisSizingMode = "FIXED";
  sidebar.counterAxisSizingMode = "FIXED";
  sidebar.resize(260, 900);
  sidebar.itemSpacing = 0;
  sidebar.paddingBottom = 8;
  sidebar.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  sidebar.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  sidebar.strokeWeight = 1;
  sidebar.strokeAlign = "OUTSIDE";
  root.appendChild(sidebar);

  // Header row: [Fleet ˅] [≡]
  const headerRow = figma.createFrame();
  headerRow.name = "Header";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisSizingMode = "FIXED";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.resize(260, 44);
  headerRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  headerRow.counterAxisAlignItems = "CENTER";
  headerRow.paddingLeft = 8; headerRow.paddingRight = 4;
  headerRow.paddingTop = 4; headerRow.paddingBottom = 4;
  headerRow.fills = [];
  sidebar.appendChild(headerRow);

  const trigger = await addComponent(headerRow, KEYS.sidebarPopoverTrigger, { "State": "Default" }, warnings);
  overrideFirstText(trigger, "Fleet", warnings);
  await addComponent(headerRow, KEYS.sidebarHeaderBtn, { "State": "Default" }, warnings);
  console.log("**  4: sidebar header done");

  addDivider(sidebar);

  // Top nav: Chat, Inbox
  const topNavGroup = createGroup(sidebar, "Top Nav", { paddingTop: 4, paddingBottom: 4 });
  for (const item of NAV_MAIN) {
    const inst = await addComponent(topNavGroup, KEYS.sidebarMenuButton,
      { "Type": "Badge", "State": item.state, "Collapsed": "False" }, warnings);
    fillH(inst);
    setProps(inst, {
      "Text#3278:82":        item.label,
      "Badge Text#3278:108": item.badge,
      "Icon#3281:0":         true,
    }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  addDivider(sidebar);

  // My Agents section
  const agentsGroup = createGroup(sidebar, "My Agents", { paddingTop: 4, paddingBottom: 4 });
  const agentsLabel = await addComponent(agentsGroup, KEYS.sidebarGroupLabel,
    { "Type": "Action", "State": "Default", "Text Size": "sm" }, warnings);
  fillH(agentsLabel);
  setProps(agentsLabel, { "Label#3278:69": "My Agents" }, warnings);

  console.log("**  5: top nav done");
  await renderTextEntry(agentsGroup, {
    label:      "Create an agent to get started",
    textStyle:  TEXT_STYLES.smNormal,
    colorToken: COLOR_VARS.mutedForeground,
  });
  console.log("**  6: my agents done");

  addDivider(sidebar);

  // Explore section
  const exploreGroup = createGroup(sidebar, "Explore", { paddingTop: 4, paddingBottom: 4 });
  const exploreLabel = await addComponent(exploreGroup, KEYS.sidebarGroupLabel,
    { "Type": "Default", "State": "Default", "Text Size": "sm" }, warnings);
  fillH(exploreLabel);
  setProps(exploreLabel, { "Label#3278:69": "Explore" }, warnings);

  for (const item of NAV_EXPLORE) {
    const inst = await addComponent(exploreGroup, KEYS.sidebarMenuButton,
      { "Type": "Simple", "State": "Default", "Collapsed": "False" }, warnings);
    fillH(inst);
    setProps(inst, { "Text#3278:82": item.label, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  console.log("**  7: explore done");
  addDivider(sidebar);

  // Bottom nav: Documentation, Settings
  const bottomNavGroup = createGroup(sidebar, "Bottom Nav", { paddingTop: 4, paddingBottom: 4 });
  for (const item of NAV_BOTTOM) {
    const inst = await addComponent(bottomNavGroup, KEYS.sidebarMenuButton,
      { "Type": "Simple", "State": "Default", "Collapsed": "False" }, warnings);
    fillH(inst);
    setProps(inst, { "Text#3278:82": item.label, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  addDivider(sidebar);

  // User block
  const userBlock = figma.createFrame();
  userBlock.name = "User Block";
  userBlock.layoutMode = "HORIZONTAL";
  userBlock.primaryAxisSizingMode = "FIXED";
  userBlock.counterAxisSizingMode = "AUTO";
  userBlock.resize(260, 40);
  userBlock.counterAxisAlignItems = "CENTER";
  userBlock.itemSpacing = 8;
  userBlock.paddingLeft = 12; userBlock.paddingRight = 12;
  userBlock.paddingTop = 4; userBlock.paddingBottom = 4;
  userBlock.fills = [];
  sidebar.appendChild(userBlock);

  console.log("**  8: bottom nav done");
  const avatarInst = await addComponent(userBlock, KEYS.avatar, { "Type": "Fallback", "Size": "8 (32px)" }, warnings);
  setProps(avatarInst, { "Fallback Text#17100:44": "VA" }, warnings);
  console.log("**  9: avatar done");

  const emailText = await styledText(
    "vietanh.ngx29@gmail.com",
    TEXT_STYLES.smNormal,
    COLOR_VARS.sidebarForeground
  );
  emailText.name = "Email";
  userBlock.appendChild(emailText);
  console.log("**  10: user block done");

  // ── MAIN CONTENT ───────────────────────────────────────────────
  const mainFrame = figma.createFrame();
  mainFrame.name = "Main Content";
  mainFrame.layoutMode = "VERTICAL";
  mainFrame.primaryAxisAlignItems = "CENTER";
  mainFrame.counterAxisAlignItems = "CENTER";
  mainFrame.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  root.appendChild(mainFrame);
  // Set sau appendChild để parent context đã sẵn sàng
  mainFrame.layoutSizingHorizontal = "FILL"; // FILL chiều ngang — chiếm phần còn lại sau sidebar
  mainFrame.layoutSizingVertical   = "FIXED"; // FIXED chiều dọc
  mainFrame.resize(mainFrame.width, 900);

  // Center panel — HUG height (wrap content), FIXED width 640
  const centerPanel = figma.createFrame();
  centerPanel.name = "Center Panel";
  centerPanel.layoutMode = "VERTICAL";
  centerPanel.primaryAxisSizingMode = "AUTO";   // HUG height
  centerPanel.counterAxisSizingMode = "FIXED";  // FIXED width
  centerPanel.resize(640, 100);                 // width=640 giữ nguyên, height sẽ HUG
  centerPanel.itemSpacing = 24;
  centerPanel.counterAxisAlignItems = "CENTER";
  centerPanel.fills = [];
  mainFrame.appendChild(centerPanel);

  console.log("**  11: main frame done");
  // "Ask anything" heading
  const heading = await styledText("Ask anything", TEXT_STYLES.xlSemibold, COLOR_VARS.foreground);
  heading.name = "Heading";
  centerPanel.appendChild(heading);
  console.log("**  12: heading done");

  // Tool selector row (8 placeholder buttons)
  const toolRow = figma.createFrame();
  toolRow.name = "Tool Selector";
  toolRow.layoutMode = "HORIZONTAL";
  toolRow.primaryAxisSizingMode = "AUTO";
  toolRow.counterAxisSizingMode = "AUTO";
  toolRow.itemSpacing = 8;
  toolRow.fills = [];
  centerPanel.appendChild(toolRow);

  const TOOL_LABELS = ["Docs", "Search", "Slack", "Linear", "Notion", "Loom", "X", "Gmail"];
  for (const name of TOOL_LABELS) {
    const btn = figma.createFrame();
    btn.name = `Tool / ${name}`;
    btn.resize(32, 32);
    btn.cornerRadius = 8;
    btn.fills = [{ type: "SOLID", color: hexToRgb("#f4f4f5") }];
    btn.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
    btn.strokeWeight = 1;
    btn.layoutMode = "HORIZONTAL";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    const label = figma.createText();
    label.characters = name.slice(0, 1);
    label.fontSize = 10;
    label.fills = [{ type: "SOLID", color: hexToRgb("#6b7280") }];
    btn.appendChild(label);
    toolRow.appendChild(btn);
  }

  // Input card — HUG height (wrap textarea + toolbar), FIXED width 640
  const inputCard = figma.createFrame();
  inputCard.name = "Input Card";
  inputCard.layoutMode = "VERTICAL";
  inputCard.primaryAxisSizingMode = "AUTO";   // HUG height
  inputCard.counterAxisSizingMode = "FIXED";  // FIXED width 640
  inputCard.resize(640, 100);
  inputCard.itemSpacing = 8;
  inputCard.paddingTop = 12; inputCard.paddingBottom = 12;
  inputCard.paddingLeft = 12; inputCard.paddingRight = 12;
  inputCard.cornerRadius = 12;
  inputCard.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  inputCard.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  inputCard.strokeWeight = 1;
  centerPanel.appendChild(inputCard);
  console.log("**  13: tool row + input card done");

  // Textarea
  const textareaInst = await addComponent(inputCard, KEYS.textarea, { "State": "Default" }, warnings);
  if (textareaInst && textareaInst.type === "INSTANCE") {
    textareaInst.layoutSizingHorizontal = "FILL";
    setProps(textareaInst, {
      "Placeholder Text#183:5": "Write your message...",
      "Counter#21247:18": false,
    }, warnings);
  }

  // Toolbar — FILL width (stretch trong inputCard), HUG height
  const toolbar = figma.createFrame();
  toolbar.name = "Toolbar";
  toolbar.layoutMode = "HORIZONTAL";
  toolbar.primaryAxisSizingMode = "AUTO";   // HUG width → overridden bởi FILL
  toolbar.counterAxisSizingMode = "AUTO";   // HUG height
  toolbar.primaryAxisAlignItems = "SPACE_BETWEEN";
  toolbar.counterAxisAlignItems = "CENTER";
  toolbar.itemSpacing = 8;
  toolbar.fills = [];
  inputCard.appendChild(toolbar);
  toolbar.layoutSizingHorizontal = "FILL";  // FILL chiều ngang trong inputCard
  console.log("**  14: textarea + toolbar done");

  // Left group: attach + model selector
  const toolbarLeft = figma.createFrame();
  toolbarLeft.name = "Toolbar Left";
  toolbarLeft.layoutMode = "HORIZONTAL";
  toolbarLeft.primaryAxisSizingMode = "AUTO";
  toolbarLeft.counterAxisSizingMode = "AUTO";
  toolbarLeft.itemSpacing = 4;
  toolbarLeft.counterAxisAlignItems = "CENTER";
  toolbarLeft.fills = [];
  toolbar.appendChild(toolbarLeft);

  // Attach button
  const attachBtn = await addComponent(toolbarLeft, KEYS.button, { "Variant": "Ghost", "Size": "icon" }, warnings);
  setProps(attachBtn, {
    "Show Left Icon#37:11": true,
    "Left Icon#46:0":       icons["Plus"] && icons["Plus"].id,
  }, warnings);
  // Model selector: Ghost button + text + chevron right
  const modelBtn = await addComponent(toolbarLeft, KEYS.button,
    { "Variant": "Ghost", "Size": "sm", "State": "Default" }, warnings);
  setProps(modelBtn, {
    "Button Text#37:10":    "Sonnet 4.6",
    "Show Left Icon#37:11": false,
    "Show Right Icon#267:0": true,
    "Right Icon#267:65":    icons["ChevronDown"] && icons["ChevronDown"].id,
  }, warnings);

  // Right group: mic + send
  const toolbarRight = figma.createFrame();
  toolbarRight.name = "Toolbar Right";
  toolbarRight.layoutMode = "HORIZONTAL";
  toolbarRight.primaryAxisSizingMode = "AUTO";
  toolbarRight.counterAxisSizingMode = "AUTO";
  toolbarRight.itemSpacing = 4;
  toolbarRight.counterAxisAlignItems = "CENTER";
  toolbarRight.fills = [];
  toolbar.appendChild(toolbarRight);

  const micBtn = await addComponent(toolbarRight, KEYS.button, { "Variant": "Ghost",   "Size": "icon" }, warnings);
  setProps(micBtn, {
    "Show Left Icon#37:11": true,
    "Left Icon#46:0":       icons["Mic"] && icons["Mic"].id,
  }, warnings);

  const sendBtn = await addComponent(toolbarRight, KEYS.button, { "Variant": "Default", "Size": "icon" }, warnings);
  setProps(sendBtn, {
    "Show Left Icon#37:11": true,
    "Left Icon#46:0":       icons["ArrowUp"] && icons["ArrowUp"].id,
  }, warnings);
  console.log("**  15: toolbar buttons done");

  // ── Done ────────────────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify(warnings.length > 0
    ? `✅ Done. ${warnings.length} warning — xem console.`
    : "✅ Done."
  );
  if (warnings.length > 0) warnings.forEach(w => console.warn("-", w));
}

// ── Helpers ──────────────────────────────────────────────────────

// Shorthand: child fills parent's horizontal axis (dùng sau appendChild)
function fillH(node) {
  if (node && "layoutSizingHorizontal" in node) node.layoutSizingHorizontal = "FILL";
}

async function addComponent(parent, key, variantProps = {}, warnings = [], wireframeRef = "") {
  try {
    const set = await figma.importComponentSetByKeyAsync(key);
    const inst = set.defaultVariant.createInstance();
    if (Object.keys(variantProps).length) inst.setProperties(variantProps);
    parent.appendChild(inst);
    logProps(inst, key);
    return inst;
  } catch (e) {
    warnings.push(`Import failed: ${key.slice(0, 8)}`);
    return addPlaceholder(parent, wireframeRef || `⚠️ ${key.slice(0, 8)}`);
  }
}

function setProps(inst, propMap, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [k, v] of Object.entries(propMap)) {
    try { inst.setProperties({ [k]: v }); }
    catch (e) { warnings.push(`setProps "${k}" failed: ${e.message}`); }
  }
}

async function swapIcon(inst, propName, iconName, icons, warnings) {
  const comp = icons[iconName];
  if (!comp) { warnings.push(`Icon "${iconName}" not imported`); return; }
  try { inst.setProperties({ [propName]: comp.id }); }
  catch (e) { warnings.push(`swapIcon "${iconName}" failed: ${e.message}`); }
}

function overrideFirstText(inst, newText, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [name, val] of Object.entries(inst.componentProperties || {})) {
    if (val.type === "TEXT") {
      try { inst.setProperties({ [name]: newText }); return; } catch (e) {}
    }
  }
  const nodes = inst.findAll(n => n.type === "TEXT");
  if (nodes[0]) { try { nodes[0].characters = newText; return; } catch (e) {} }
  if (warnings) warnings.push(`overrideFirstText "${newText}" failed on ${inst.name}`);
}

function createGroup(parent, name, { width = 260, paddingTop = 0, paddingBottom = 0, gap = 2 } = {}) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "FIXED";
  frame.resize(width, 100);
  frame.itemSpacing = gap;
  frame.paddingLeft = 8; frame.paddingRight = 8;
  frame.paddingTop = paddingTop; frame.paddingBottom = paddingBottom;
  frame.fills = [];
  parent.appendChild(frame);
  return frame;
}

function addDivider(parent, width = 260) {
  const line = figma.createLine();
  line.resize(width, 0);
  line.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  line.strokeWeight = 1;
  parent.appendChild(line);
}

function addPlaceholder(parent, wireframeRef, { width = 120, height = 48 } = {}) {
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

async function styledText(characters, textStyleKey, colorVarKey) {
  const t = figma.createText();
  t.characters = characters;
  try {
    const style = await figma.importStyleByKeyAsync(textStyleKey);
    t.textStyleId = style.id;
  } catch (e) { console.warn("Text style import fail:", textStyleKey); }
  try {
    const v = await figma.variables.importVariableByKeyAsync(colorVarKey);
    t.fills = [figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v
    )];
  } catch (e) { console.warn("Color var import fail:", colorVarKey); }
  return t;
}

async function renderTextEntry(parent, entry, { width = 228 } = {}) {
  const frame = figma.createFrame();
  frame.name = entry.label || "Text";
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisSizingMode = "FIXED";
  frame.counterAxisSizingMode = "AUTO";
  frame.resize(width, 10);
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingLeft = 8; frame.paddingRight = 8;
  frame.paddingTop = 4; frame.paddingBottom = 4;
  frame.fills = [];
  const t = await styledText(entry.label, entry.textStyle, entry.colorToken);
  frame.appendChild(t);
  parent.appendChild(frame);
  return frame;
}

const _loggedKeys = new Set();
function logProps(inst, key) {
  if (_loggedKeys.has(key)) return;
  _loggedKeys.add(key);
  const props = Object.entries(inst.componentProperties || {});
  if (!props.length) return;
  console.log(`[${inst.name}]:`);
  props
    .filter(([, v]) => ["TEXT", "INSTANCE_SWAP", "BOOLEAN"].includes(v.type))
    .forEach(([n, v]) => console.log(`  · ${n}: ${v.type} = ${JSON.stringify(v.value)}`));
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

main().catch(console.error);
