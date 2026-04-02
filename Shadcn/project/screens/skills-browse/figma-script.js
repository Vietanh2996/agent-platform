// ─────────────────────────────────────────────────────────────────────────────
// Figma Script — Skills / Browse Library
// Screen: 1440x900, sidebar-left + modal overlay
// Split: Part 1 = sidebar | Part 2 = main content + modal
// ─────────────────────────────────────────────────────────────────────────────

// ── PART 1: SIDEBAR ──────────────────────────────────────────────────────────

const KEYS = {
  sidebarPopoverTrigger: "5c3305b6fa553b99f43236a0e43a8895b216149a",
  sidebarHeaderBtn:      "80fe8e5131827a423537d2f8333ca0d722ad5e85",
  sidebarMenuButton:     "800b15de9b43c352f2053b53b0ca5198ebef4256",
  sidebarGroupLabel:     "edc1265c667eee6d45fd5cccaf305d1bd2e0ac46",
  avatar:                "4c4c8c7c48e76c4db623a4583d17f5d4625b0dbb",
};

const ICON_KEYS = {
  MessageSquare: "c960edd51cc4da789ae4735ae65051d7167d13d0",
  Inbox:         "a5727972e7978e7ba7cb70ad84d5f9f27ae67fce",
  Zap:           "1ed0c53df6f0e88bd66468c47cf3387557f7db52",
  FileText:      "ebbaf5f2940884e7258ec43666554f392809436b",
  Puzzle:        "c05ecbfb998988f02a75be1b0254cb008b956dc5",
  Bot:           "4648832fff6c13915f927e4d1c72c24462e9eaef",
  BookOpen:      "931817e5238277d396bc9fbf19ae1f2fcb4f6e83",
  Settings:      "c576bbad214d71896150fc219570b6410c84f6be",
};

const TEXT_STYLES = {
  smNormal:    "18bc7e1f33b627174309265d7e1c046264cf16bf",
  smMedium:    "b38a907677508f128d9a0c54b3f47c9931b3f910",
  smSemibold:  "5626b770669ffbf7048f2fc2730c9f5f3cbc900b",
  xsNormal:    "845e2807d7bd156cd78a7dc1a9d57c3ae578e309",
};

const COLOR_VARS = {
  foreground:        "aab20ced11a334856ec9331cf98dd2f1637ff70a",
  mutedForeground:   "1933717cc251a338091aca27fdfa264aa1b0479a",
  sidebarForeground: "f73d9ec93a3682484e8af69077eaba20d5406a66",
};

async function main() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  const warnings = [];

  const icons = {};
  for (const [name, key] of Object.entries(ICON_KEYS)) {
    try { icons[name] = await figma.importComponentByKeyAsync(key); }
    catch (e) { console.warn("Icon fail:", name); }
  }

  // Root frame
  const root = findOrCreateFrame("Skills / Browse Library");
  for (const child of [...root.children]) child.remove();
  root.layoutMode = "HORIZONTAL";
  root.primaryAxisSizingMode = "FIXED";
  root.counterAxisSizingMode = "FIXED";
  root.resize(1440, 900);
  root.itemSpacing = 0;
  root.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  root.clipsContent = true;

  // ── SIDEBAR ──
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar";
  sidebar.layoutMode = "VERTICAL";
  sidebar.primaryAxisSizingMode = "AUTO";
  sidebar.counterAxisSizingMode = "FIXED";
  sidebar.resize(260, 100);
  sidebar.itemSpacing = 0;
  sidebar.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  sidebar.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  sidebar.strokeWeight = 1; sidebar.strokeAlign = "INSIDE";
  sidebar.strokeTopWeight = 0; sidebar.strokeBottomWeight = 0;
  sidebar.strokeLeftWeight = 0; sidebar.strokeRightWeight = 1;
  root.appendChild(sidebar);
  sidebar.layoutSizingVertical = "FILL";

  // Header row
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

  const trigger = await addComponent(headerRow, KEYS.sidebarPopoverTrigger, { "State": "Default" }, warnings, {});
  overrideFirstText(trigger, "Fleet", warnings);
  await addComponent(headerRow, KEYS.sidebarHeaderBtn, { "State": "Default" }, warnings, {});

  addDivider(sidebar);

  // Top nav
  const topNavGroup = createGroup(sidebar, "Top Nav", { paddingTop: 4, paddingBottom: 4, gap: 2 });
  for (const item of [
    { label: "Chat",  icon: "MessageSquare", badge: "3", state: "Default" },
    { label: "Inbox", icon: "Inbox",         badge: "3", state: "Default" },
  ]) {
    const inst = await addComponent(topNavGroup, KEYS.sidebarMenuButton,
      { "Type": "Badge", "State": item.state, "Collapsed": "False" }, warnings, { fillWidth: true });
    setProps(inst, { "Text#3278:82": item.label, "Badge Text#3278:108": item.badge, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  addDivider(sidebar);

  // My Agents
  const agentsGroup = createGroup(sidebar, "My Agents", { paddingTop: 4, paddingBottom: 4, gap: 2 });
  const agentsLabel = await addComponent(agentsGroup, KEYS.sidebarGroupLabel,
    { "Type": "Action", "State": "Default", "Text Size": "sm" }, warnings, { fillWidth: true });
  setProps(agentsLabel, { "Label#3278:69": "My Agents" }, warnings);
  await renderTextEntry(agentsGroup, { label: "Create an agent to get started",
    textStyle: TEXT_STYLES.smNormal, colorToken: COLOR_VARS.mutedForeground });

  addDivider(sidebar);

  // Explore — Skills is ACTIVE
  const exploreGroup = createGroup(sidebar, "Explore", { paddingTop: 4, paddingBottom: 4, gap: 2 });
  const exploreLabel = await addComponent(exploreGroup, KEYS.sidebarGroupLabel,
    { "Type": "Default", "State": "Default", "Text Size": "sm" }, warnings, { fillWidth: true });
  setProps(exploreLabel, { "Label#3278:69": "Explore" }, warnings);
  for (const item of [
    { label: "Integrations",     icon: "Zap",      state: "Default" },
    { label: "Skills",           icon: "FileText",  state: "Active"  },
    { label: "Templates",        icon: "Puzzle",    state: "Default" },
    { label: "Workspace Agents", icon: "Bot",       state: "Default" },
  ]) {
    const inst = await addComponent(exploreGroup, KEYS.sidebarMenuButton,
      { "Type": "Simple", "State": item.state, "Collapsed": "False" }, warnings, { fillWidth: true });
    setProps(inst, { "Text#3278:82": item.label, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  // Spacer
  const spacer = figma.createFrame();
  spacer.name = "Spacer"; spacer.layoutMode = "VERTICAL";
  spacer.primaryAxisSizingMode = "AUTO"; spacer.counterAxisSizingMode = "AUTO";
  spacer.fills = [];
  sidebar.appendChild(spacer);
  spacer.layoutSizingVertical = "FILL";

  addDivider(sidebar);

  // Bottom nav
  const bottomNavGroup = createGroup(sidebar, "Bottom Nav", { paddingTop: 4, paddingBottom: 4, gap: 2 });
  for (const item of [
    { label: "Documentation", icon: "BookOpen" },
    { label: "Settings",      icon: "Settings" },
  ]) {
    const inst = await addComponent(bottomNavGroup, KEYS.sidebarMenuButton,
      { "Type": "Simple", "State": "Default", "Collapsed": "False" }, warnings, { fillWidth: true });
    setProps(inst, { "Text#3278:82": item.label, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  addDivider(sidebar);

  // User block
  const userBlock = figma.createFrame();
  userBlock.name = "User Block"; userBlock.layoutMode = "HORIZONTAL";
  userBlock.primaryAxisSizingMode = "AUTO"; userBlock.counterAxisSizingMode = "AUTO";
  userBlock.counterAxisAlignItems = "CENTER"; userBlock.itemSpacing = 8;
  userBlock.paddingLeft = 12; userBlock.paddingRight = 12;
  userBlock.paddingTop = 8; userBlock.paddingBottom = 8;
  userBlock.fills = [];
  sidebar.appendChild(userBlock);
  userBlock.layoutSizingHorizontal = "FILL";

  const avatarInst = await addComponent(userBlock, KEYS.avatar,
    { "Type": "Fallback", "Size": "6 (24px)" }, warnings, {});
  overrideFirstText(avatarInst, "VA", warnings);
  const emailText = await styledText("vietanh.ngx29@gmail.com", TEXT_STYLES.smNormal, COLOR_VARS.sidebarForeground);
  emailText.name = "Email";
  userBlock.appendChild(emailText);

  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify(warnings.length > 0 ? `Part 1 done. ${warnings.length} warnings.` : "Part 1 done — sidebar OK.");
  if (warnings.length > 0) warnings.forEach(w => console.warn("-", w));
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

async function addComponent(parent, key, variantProps = {}, warnings = [], { fillWidth = false } = {}) {
  try {
    const set = await figma.importComponentSetByKeyAsync(key);
    const inst = set.defaultVariant.createInstance();
    if (Object.keys(variantProps).length > 0) inst.setProperties(variantProps);
    parent.appendChild(inst);
    if (fillWidth) inst.layoutSizingHorizontal = "FILL";
    return inst;
  } catch (e) {
    warnings.push(`Import failed: ${key.slice(0,8)} — ${e.message}`);
    const ph = figma.createFrame(); ph.name = `[ph] ${key.slice(0,8)}`; ph.resize(200,36);
    ph.fills = [{ type:"SOLID", color:{ r:0.95,g:0.95,b:0.95 } }];
    parent.appendChild(ph);
    if (fillWidth) ph.layoutSizingHorizontal = "FILL";
    return ph;
  }
}

function setProps(inst, propMap, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [key, value] of Object.entries(propMap)) {
    try { inst.setProperties({ [key]: value }); }
    catch (e) { warnings.push(`setProps "${key}": ${e.message}`); }
  }
}

async function swapIcon(inst, propName, iconName, icons, warnings) {
  const comp = icons[iconName];
  if (!comp) { warnings.push(`Icon not imported: ${iconName}`); return; }
  try { inst.setProperties({ [propName]: comp.id }); }
  catch (e) { warnings.push(`swapIcon ${iconName}: ${e.message}`); }
}

function overrideFirstText(inst, newText, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [name, val] of Object.entries(inst.componentProperties || {})) {
    if (val.type === "TEXT") { try { inst.setProperties({ [name]: newText }); return; } catch (e) {} }
  }
  const nodes = inst.findAll(n => n.type === "TEXT");
  if (nodes[0]) { try { nodes[0].characters = newText; return; } catch (e) {} }
}

function createGroup(parent, name, { paddingTop=0, paddingBottom=0, gap=2 }={}) {
  const f = figma.createFrame();
  f.name = name; f.layoutMode = "VERTICAL";
  f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = gap; f.paddingLeft = 8; f.paddingRight = 8;
  f.paddingTop = paddingTop; f.paddingBottom = paddingBottom;
  f.fills = [];
  parent.appendChild(f);
  f.layoutSizingHorizontal = "FILL";
  return f;
}

function addDivider(parent) {
  const d = figma.createFrame();
  d.name = "Divider"; d.layoutMode = "HORIZONTAL";
  d.primaryAxisSizingMode = "AUTO"; d.counterAxisSizingMode = "AUTO";
  d.resize(4, 1);
  d.fills = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  parent.appendChild(d);
  d.layoutSizingHorizontal = "FILL";
}

async function renderTextEntry(parent, entry) {
  const frame = figma.createFrame();
  frame.name = entry.label || "Text";
  frame.resize(228, 32); frame.layoutMode = "HORIZONTAL";
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingLeft = 8; frame.paddingRight = 8; frame.fills = [];
  const t = await styledText(entry.label, entry.textStyle, entry.colorToken);
  frame.appendChild(t); parent.appendChild(frame);
  frame.layoutSizingHorizontal = "FILL";
  return frame;
}

async function styledText(characters, textStyleKey, colorVarKey) {
  const t = figma.createText(); t.characters = characters;
  try { const s = await figma.importStyleByKeyAsync(textStyleKey); t.textStyleId = s.id; }
  catch (e) {}
  try {
    const v = await figma.variables.importVariableByKeyAsync(colorVarKey);
    t.fills = [figma.variables.setBoundVariableForPaint({ type:"SOLID", color:{r:0,g:0,b:0} }, "color", v)];
  } catch (e) {}
  return t;
}

function findOrCreateFrame(name, parent = figma.currentPage) {
  return parent.findChild(n => n.type === "FRAME" && n.name === name)
    ?? (() => { const f = figma.createFrame(); f.name = name; parent.appendChild(f); return f; })();
}

function hexToRgb(hex) {
  return { r: parseInt(hex.slice(1,3),16)/255, g: parseInt(hex.slice(3,5),16)/255, b: parseInt(hex.slice(5,7),16)/255 };
}

main().catch(console.error);

// ── PART 2 CODE (run as separate MCP call) ───────────────────────────────────
// See comment below — paste Part 2 code into a new use_figma call after Part 1 completes.
