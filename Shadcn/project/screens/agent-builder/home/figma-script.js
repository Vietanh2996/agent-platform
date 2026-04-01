// ─────────────────────────────────────────────────────────────────────────────
// Figma Script — Agent Builder / Home
// Screen: 1440x900, sidebar-left layout
// Generated: 2026-04-01
// Paste into Scripter plugin (Figma) and Run.
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  sidebarPopoverTrigger: "5c3305b6fa553b99f43236a0e43a8895b216149a",
  sidebarHeaderBtn:      "80fe8e5131827a423537d2f8333ca0d722ad5e85",
  sidebarMenuButton:     "800b15de9b43c352f2053b53b0ca5198ebef4256",
  sidebarGroupLabel:     "edc1265c667eee6d45fd5cccaf305d1bd2e0ac46",
  avatar:                "4c4c8c7c48e76c4db623a4583d17f5d4625b0dbb",
  textarea:              "7fded121e55260531648b06bb96eec8da63d956f",
  button:                "cbd1ecb229351f6dd6bc58462d01c2f360ea7ae1",
  combobox:              "d664e7b3bebdbbb3326cfcccca6cb6f2af91585b",
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
  Plus:          "72a0d91e271ddc58fb097210a0ca6d37a7300090",
  Mic:           "a626253f069d114c3968086cab4f4f306a7f2df6",
  ArrowUp:       "6e2916eb915b959ab016afe7817f10f3cb3e6c45",
};

const TEXT_STYLES = {
  smNormal:   "18bc7e1f33b627174309265d7e1c046264cf16bf", // text-sm/leading-normal/normal
  xlSemibold: "144b63084c8a3d11f60b04ec2d2279276b8044a7", // text-xl/leading-normal/semibold
};

const COLOR_VARS = {
  foreground:        "aab20ced11a334856ec9331cf98dd2f1637ff70a", // base/foreground
  mutedForeground:   "1933717cc251a338091aca27fdfa264aa1b0479a", // base/muted-foreground
  sidebarForeground: "f73d9ec93a3682484e8af69077eaba20d5406a66", // base/sidebar-foreground
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  const warnings = [];

  // Pre-import icons
  const icons = {};
  for (const [name, key] of Object.entries(ICON_KEYS)) {
    try { icons[name] = await figma.importComponentByKeyAsync(key); }
    catch (e) { console.warn("Icon import fail:", name, e.message); }
  }

  // ── Root frame (1440x900, HORIZONTAL: sidebar + main) ──────────────────────
  const root = figma.createFrame();
  root.name = "Agent Builder / Home";
  root.layoutMode = "HORIZONTAL";        // set layoutMode TRƯỚC
  root.primaryAxisSizingMode = "FIXED"; // rồi lock sizing modes
  root.counterAxisSizingMode = "FIXED";
  root.resize(1440, 900);               // resize SAU khi modes đã lock
  root.itemSpacing = 0;
  root.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  root.clipsContent = true;
  figma.currentPage.appendChild(root);

  // ── SIDEBAR ─────────────────────────────────────────────────────────────────
  // FIXED width 260, FILL height (set AFTER appendChild)
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar";
  sidebar.layoutMode = "VERTICAL";
  sidebar.primaryAxisSizingMode = "AUTO";  // height will become FILL
  sidebar.counterAxisSizingMode = "FIXED"; // width FIXED at 260
  sidebar.resize(260, 100);
  sidebar.itemSpacing = 0;
  sidebar.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  // Right border only — set individual stroke weights
  sidebar.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  sidebar.strokeWeight = 1;
  sidebar.strokeAlign = "INSIDE";
  sidebar.strokeTopWeight = 0;
  sidebar.strokeBottomWeight = 0;
  sidebar.strokeLeftWeight = 0;
  sidebar.strokeRightWeight = 1;
  root.appendChild(sidebar);
  sidebar.layoutSizingVertical = "FILL"; // FILL height AFTER appendChild

  // Header row: [Fleet dropdown] <SPACE_BETWEEN> [toggle btn]
  const headerRow = figma.createFrame();
  headerRow.name = "Header";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisSizingMode = "FIXED";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.resize(260, 44);
  headerRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  headerRow.counterAxisAlignItems = "CENTER";
  headerRow.paddingLeft = 8;
  headerRow.paddingRight = 4;
  headerRow.paddingTop = 4;
  headerRow.paddingBottom = 4;
  headerRow.fills = [];
  sidebar.appendChild(headerRow);

  const trigger = await addComponent(
    headerRow, KEYS.sidebarPopoverTrigger, { "State": "Default" }, warnings,
    { wireframeRef: "Sidebar > Header row > App name dropdown" }
  );
  overrideFirstText(trigger, "Fleet", warnings);

  await addComponent(
    headerRow, KEYS.sidebarHeaderBtn, { "State": "Default" }, warnings,
    { wireframeRef: "Sidebar > Header row > Collapse toggle" }
  );

  addDivider(sidebar);

  // Top nav: Chat, Inbox
  const topNavGroup = createGroup(sidebar, "Top Nav", { paddingTop: 4, paddingBottom: 4, gap: 2 });

  const NAV_MAIN = [
    { label: "Chat",  icon: "MessageSquare", badge: "3", state: "Default" },
    { label: "Inbox", icon: "Inbox",         badge: "3", state: "Active"  },
  ];
  for (const item of NAV_MAIN) {
    const inst = await addComponent(
      topNavGroup, KEYS.sidebarMenuButton,
      { "Type": "Badge", "State": item.state, "Collapsed": "False" }, warnings,
      { fillWidth: true, wireframeRef: `Sidebar > Top nav > ${item.label}` }
    );
    setProps(inst, {
      "Text#3278:82":        item.label,
      "Badge Text#3278:108": item.badge,
      "Icon#3281:0":         true,
    }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  addDivider(sidebar);

  // My Agents section
  const agentsGroup = createGroup(sidebar, "My Agents", { paddingTop: 4, paddingBottom: 4, gap: 2 });

  const agentsLabel = await addComponent(
    agentsGroup, KEYS.sidebarGroupLabel,
    { "Type": "Action", "State": "Default", "Text Size": "sm" }, warnings,
    { fillWidth: true, wireframeRef: "Sidebar > My Agents > Label" }
  );
  setProps(agentsLabel, { "Label#3278:69": "My Agents" }, warnings);

  // Empty state text
  await renderTextEntry(agentsGroup, {
    label:      "Create an agent to get started",
    textStyle:  TEXT_STYLES.smNormal,
    colorToken: COLOR_VARS.mutedForeground,
  });

  addDivider(sidebar);

  // Explore section
  const exploreGroup = createGroup(sidebar, "Explore", { paddingTop: 4, paddingBottom: 4, gap: 2 });

  const exploreLabel = await addComponent(
    exploreGroup, KEYS.sidebarGroupLabel,
    { "Type": "Default", "State": "Default", "Text Size": "sm" }, warnings,
    { fillWidth: true, wireframeRef: "Sidebar > Explore > Label" }
  );
  setProps(exploreLabel, { "Label#3278:69": "Explore" }, warnings);

  const NAV_EXPLORE = [
    { label: "Integrations",     icon: "Zap"      },
    { label: "Skills",           icon: "FileText" },
    { label: "Templates",        icon: "Puzzle"   },
    { label: "Workspace Agents", icon: "Bot"      },
  ];
  for (const item of NAV_EXPLORE) {
    const inst = await addComponent(
      exploreGroup, KEYS.sidebarMenuButton,
      { "Type": "Simple", "State": "Default", "Collapsed": "False" }, warnings,
      { fillWidth: true, wireframeRef: `Sidebar > Explore > ${item.label}` }
    );
    setProps(inst, { "Text#3278:82": item.label, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  addDivider(sidebar);

  // Bottom nav: Documentation, Settings
  const bottomNavGroup = createGroup(sidebar, "Bottom Nav", { paddingTop: 4, paddingBottom: 4, gap: 2 });

  const NAV_BOTTOM = [
    { label: "Documentation", icon: "BookOpen" },
    { label: "Settings",      icon: "Settings" },
  ];
  for (const item of NAV_BOTTOM) {
    const inst = await addComponent(
      bottomNavGroup, KEYS.sidebarMenuButton,
      { "Type": "Simple", "State": "Default", "Collapsed": "False" }, warnings,
      { fillWidth: true, wireframeRef: `Sidebar > Bottom nav > ${item.label}` }
    );
    setProps(inst, { "Text#3278:82": item.label, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  addDivider(sidebar);

  // User block: Avatar + email — HORIZONTAL, paddingLeft/Right 12, paddingTop/Bottom 8
  const userBlock = figma.createFrame();
  userBlock.name = "User Block";
  userBlock.layoutMode = "HORIZONTAL";
  userBlock.primaryAxisSizingMode = "AUTO";
  userBlock.counterAxisSizingMode = "AUTO";
  userBlock.counterAxisAlignItems = "CENTER";
  userBlock.itemSpacing = 8;
  userBlock.paddingLeft = 12;
  userBlock.paddingRight = 12;
  userBlock.paddingTop = 8;
  userBlock.paddingBottom = 8;
  userBlock.fills = [];
  sidebar.appendChild(userBlock);
  userBlock.layoutSizingHorizontal = "FILL"; // FILL sidebar width AFTER appendChild

  const avatarInst = await addComponent(
    userBlock, KEYS.avatar,
    { "Type": "Fallback", "Size": "6 (24px)" }, warnings,
    { wireframeRef: "Sidebar > User block > Avatar" }
  );
  overrideFirstText(avatarInst, "VA", warnings);

  const emailText = await styledText(
    "vietanh.ngx29@gmail.com",
    TEXT_STYLES.smNormal,
    COLOR_VARS.sidebarForeground
  );
  emailText.name = "Email";
  userBlock.appendChild(emailText);

  // ── MAIN CONTENT ────────────────────────────────────────────────────────────
  // FILL both axes, CENTER children (primary + counter)
  const mainContent = figma.createFrame();
  mainContent.name = "Main Content";
  mainContent.layoutMode = "VERTICAL";
  mainContent.primaryAxisSizingMode = "AUTO";
  mainContent.counterAxisSizingMode = "AUTO";
  mainContent.primaryAxisAlignItems = "CENTER";
  mainContent.counterAxisAlignItems = "CENTER";
  mainContent.itemSpacing = 0;
  mainContent.fills = [{ type: "SOLID", color: hexToRgb("#fafafa") }];
  root.appendChild(mainContent);
  mainContent.layoutSizingHorizontal = "FILL"; // FILL remaining width AFTER appendChild
  mainContent.layoutSizingVertical   = "FILL"; // FILL full height AFTER appendChild

  // Center panel: VERTICAL, FIXED 640px wide, AUTO height, itemSpacing 24
  const centerPanel = figma.createFrame();
  centerPanel.name = "Center Panel";
  centerPanel.layoutMode = "VERTICAL";
  centerPanel.counterAxisSizingMode = "FIXED"; // FIXED width
  centerPanel.resize(640, 100);                // resize TRƯỚC — set width, height placeholder
  centerPanel.primaryAxisSizingMode = "AUTO";  // HUG height — set SAU resize() để không bị override
  centerPanel.itemSpacing = 24;
  centerPanel.counterAxisAlignItems = "CENTER";
  centerPanel.fills = [];
  mainContent.appendChild(centerPanel);
  // Width stays FIXED (640) — do NOT set FILL

  // "Ask anything" heading — text-xl/semibold + foreground
  const heading = await styledText("Ask anything", TEXT_STYLES.xlSemibold, COLOR_VARS.foreground);
  heading.name = "Heading";
  heading.textAlignHorizontal = "CENTER";
  centerPanel.appendChild(heading);

  // Tool selector: 8 brand icon placeholders, HORIZONTAL, gap 8, centered
  const toolRow = figma.createFrame();
  toolRow.name = "Tool Selector";
  toolRow.layoutMode = "HORIZONTAL";
  toolRow.primaryAxisSizingMode = "AUTO";
  toolRow.counterAxisSizingMode = "AUTO";
  toolRow.primaryAxisAlignItems = "CENTER";
  toolRow.counterAxisAlignItems = "CENTER";
  toolRow.itemSpacing = 8;
  toolRow.fills = [];
  centerPanel.appendChild(toolRow);

  const TOOL_ITEMS = [
    { label: "Google Docs" },
    { label: "Perplexity"  },
    { label: "Slack"       },
    { label: "Linear"      },
    { label: "Notion"      },
    { label: "Loom"        },
    { label: "X/Twitter"   },
    { label: "Gmail"       },
  ];
  for (const tool of TOOL_ITEMS) {
    const chip = figma.createFrame();
    chip.name = `Tool / ${tool.label}`;
    chip.resize(32, 32);
    chip.cornerRadius = 6;
    chip.layoutMode = "HORIZONTAL";
    chip.primaryAxisAlignItems = "CENTER";
    chip.counterAxisAlignItems = "CENTER";
    chip.fills = [{ type: "SOLID", color: hexToRgb("#f4f4f5") }];
    chip.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
    chip.strokeWeight = 1;
    chip.dashPattern = [4, 4];

    const lbl = figma.createText();
    lbl.characters = tool.label.charAt(0).toUpperCase();
    lbl.fontSize = 12;
    lbl.fontName = { family: "Inter", style: "Medium" };
    lbl.fills = [{ type: "SOLID", color: hexToRgb("#6b7280") }];
    chip.appendChild(lbl);
    toolRow.appendChild(chip);
  }

  // Chat input card: VERTICAL, FIXED 640px, padding 12, rounded 12
  const chatCard = figma.createFrame();
  chatCard.name = "Chat Input Card";
  chatCard.layoutMode = "VERTICAL";
  chatCard.primaryAxisSizingMode = "AUTO";  // HUG height
  chatCard.counterAxisSizingMode = "FIXED"; // FIXED width 640
  chatCard.resize(640, 100);
  chatCard.itemSpacing = 8;
  chatCard.paddingTop = 12;
  chatCard.paddingBottom = 12;
  chatCard.paddingLeft = 12;
  chatCard.paddingRight = 12;
  chatCard.cornerRadius = 12;
  chatCard.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  chatCard.strokes = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  chatCard.strokeWeight = 1;
  centerPanel.appendChild(chatCard);

  // Textarea — fillWidth in VERTICAL parent
  const textareaInst = await addComponent(
    chatCard, KEYS.textarea,
    { "State": "Default", "Filled": "False" }, warnings,
    { fillWidth: true, wireframeRef: "Main Content > Center panel > Chat input card > Textarea" }
  );
  // logProps already called inside addComponent — check console for prop names
  setProps(textareaInst, {
    "Placeholder Text#183:5": "Write your message...",
    "Counter#21247:18":       false,
  }, warnings);

  // Toolbar: HORIZONTAL SPACE_BETWEEN, fills card width
  const toolbar = figma.createFrame();
  toolbar.name = "Toolbar";
  toolbar.layoutMode = "HORIZONTAL";
  toolbar.primaryAxisSizingMode = "AUTO";
  toolbar.counterAxisSizingMode = "AUTO";
  toolbar.primaryAxisAlignItems = "SPACE_BETWEEN";
  toolbar.counterAxisAlignItems = "CENTER";
  toolbar.itemSpacing = 4;
  toolbar.fills = [];
  chatCard.appendChild(toolbar);
  toolbar.layoutSizingHorizontal = "FILL"; // FILL card width AFTER appendChild

  // Toolbar Left: [attach btn] [combobox / model selector]
  const toolbarLeft = figma.createFrame();
  toolbarLeft.name = "Toolbar Left";
  toolbarLeft.layoutMode = "HORIZONTAL";
  toolbarLeft.primaryAxisSizingMode = "AUTO";
  toolbarLeft.counterAxisSizingMode = "AUTO";
  toolbarLeft.counterAxisAlignItems = "CENTER";
  toolbarLeft.itemSpacing = 4;
  toolbarLeft.fills = [];
  toolbar.appendChild(toolbarLeft);

  // Attach button — Ghost, icon-sm, Plus icon
  const attachBtn = await addComponent(
    toolbarLeft, KEYS.button,
    { "Variant": "Ghost", "Size": "icon-sm", "State": "Default" }, warnings,
    { wireframeRef: "Main Content > Center panel > Chat input card > Toolbar > Attach" }
  );
  // logProps will print exact boolean + INSTANCE_SWAP prop names on first run.
  // Common prop name patterns for Button icon-only — try both, setProps skips failed ones.
  setProps(attachBtn, {
    "Icon Only#0:1":         true,
    "Show Left Icon#37:11":  true,
    "Show Icon#0:2":         true,
  }, warnings);
  await swapIcon(attachBtn, "Left Icon#46:0",      "Plus", icons, warnings);
  await swapIcon(attachBtn, "Icon Name#0:2",        "Plus", icons, warnings);
  await swapIcon(attachBtn, "Left Icon Name#37:12", "Plus", icons, warnings);

  // Combobox — model selector, Filled=True
  const comboboxInst = await addComponent(
    toolbarLeft, KEYS.combobox,
    { "Filled": "True", "State": "Default" }, warnings,
    { wireframeRef: "Main Content > Center panel > Chat input card > Toolbar > Model selector" }
  );
  // logProps will print exact prop names. overrideFirstText as safe fallback.
  setProps(comboboxInst, { "Value text#21235:14": "Sonnet 4.6" }, warnings);

  // Toolbar Right: [voice btn] [send btn]
  const toolbarRight = figma.createFrame();
  toolbarRight.name = "Toolbar Right";
  toolbarRight.layoutMode = "HORIZONTAL";
  toolbarRight.primaryAxisSizingMode = "AUTO";
  toolbarRight.counterAxisSizingMode = "AUTO";
  toolbarRight.counterAxisAlignItems = "CENTER";
  toolbarRight.itemSpacing = 4;
  toolbarRight.fills = [];
  toolbar.appendChild(toolbarRight);

  // Voice button — Ghost, icon, Mic
  const voiceBtn = await addComponent(
    toolbarRight, KEYS.button,
    { "Variant": "Ghost", "Size": "icon", "State": "Default" }, warnings,
    { wireframeRef: "Main Content > Center panel > Chat input card > Toolbar > Voice" }
  );
  setProps(voiceBtn, {
    "Icon Only#0:1":         true,
    "Show Left Icon#37:11":  true,
    "Show Icon#0:2":         true,
  }, warnings);
  await swapIcon(voiceBtn, "Left Icon#46:0",      "Mic", icons, warnings);
  await swapIcon(voiceBtn, "Icon Name#0:2",        "Mic", icons, warnings);
  await swapIcon(voiceBtn, "Left Icon Name#37:12", "Mic", icons, warnings);

  // Send button — Default (primary), icon, ArrowUp
  const sendBtn = await addComponent(
    toolbarRight, KEYS.button,
    { "Variant": "Default", "Size": "icon", "State": "Default" }, warnings,
    { wireframeRef: "Main Content > Center panel > Chat input card > Toolbar > Send" }
  );
  setProps(sendBtn, {
    "Icon Only#0:1":         true,
    "Show Left Icon#37:11":  true,
    "Show Icon#0:2":         true,
  }, warnings);
  await swapIcon(sendBtn, "Left Icon#46:0",      "ArrowUp", icons, warnings);
  await swapIcon(sendBtn, "Icon Name#0:2",        "ArrowUp", icons, warnings);
  await swapIcon(sendBtn, "Left Icon Name#37:12", "ArrowUp", icons, warnings);

  // ── Done ────────────────────────────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify(
    warnings.length > 0
      ? `Done. ${warnings.length} warning(s) — check console.`
      : "Done."
  );
  if (warnings.length > 0) warnings.forEach(w => console.warn("-", w));
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Import a component set from DS and create an instance.
 * fillWidth: true  → set layoutSizingHorizontal = "FILL" after appendChild
 *                    (use for items in a VERTICAL parent like sidebar groups)
 */
async function addComponent(
  parent,
  key,
  variantProps = {},
  warnings = [],
  { fillWidth = false, wireframeRef = "" } = {}
) {
  try {
    const set = await figma.importComponentSetByKeyAsync(key);
    const inst = set.defaultVariant.createInstance();
    if (Object.keys(variantProps).length > 0) {
      inst.setProperties(variantProps);
    }
    parent.appendChild(inst);
    if (fillWidth) inst.layoutSizingHorizontal = "FILL"; // FILL AFTER appendChild
    logProps(inst, key); // discover prop names — check console on first run
    return inst;
  } catch (e) {
    console.warn("Import failed:", key.slice(0, 8), e.message);
    warnings.push(`Import failed: ${key.slice(0, 8)} — ${wireframeRef}`);
    return addPlaceholder(parent, wireframeRef || key.slice(0, 8));
  }
}

/**
 * Set multiple component properties at once. Skips unknown props silently,
 * pushes warning for each failure.
 */
function setProps(inst, propMap, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [key, value] of Object.entries(propMap)) {
    try { inst.setProperties({ [key]: value }); }
    catch (e) { warnings.push(`setProps "${key}" failed: ${e.message}`); }
  }
}

/**
 * Swap icon in an INSTANCE_SWAP slot.
 * Pre-import icons first via importComponentByKeyAsync.
 */
async function swapIcon(inst, swapPropName, iconName, icons, warnings) {
  const comp = icons[iconName];
  if (!comp) { warnings.push(`Icon "${iconName}" not imported`); return; }
  try { inst.setProperties({ [swapPropName]: comp.id }); }
  catch (e) { warnings.push(`swapIcon "${iconName}" on "${swapPropName}": ${e.message}`); }
}

/**
 * Override the first TEXT componentProperty found, with direct node fallback.
 * Use when exact property name is unknown.
 */
function overrideFirstText(inst, newText, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [name, val] of Object.entries(inst.componentProperties || {})) {
    if (val.type === "TEXT") {
      try { inst.setProperties({ [name]: newText }); return; } catch (e) {}
    }
  }
  const nodes = inst.findAll(n => n.type === "TEXT");
  if (nodes[0]) {
    try { nodes[0].characters = newText; return; } catch (e) {}
  }
  if (warnings) warnings.push(`overrideFirstText "${newText}" failed on ${inst.name}`);
}

/**
 * Create a vertical group frame (section in sidebar).
 * After appendChild, sets layoutSizingHorizontal = "FILL" so group fills parent.
 */
function createGroup(
  parent,
  name,
  { paddingTop = 0, paddingBottom = 0, gap = 2 } = {}
) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO"; // width will be FILL — not FIXED
  frame.itemSpacing = gap;
  frame.paddingLeft = 8;
  frame.paddingRight = 8;
  frame.paddingTop = paddingTop;
  frame.paddingBottom = paddingBottom;
  frame.fills = [];
  parent.appendChild(frame);
  frame.layoutSizingHorizontal = "FILL"; // FILL sidebar width AFTER appendChild
  return frame;
}

/**
 * 1px divider Frame — more stable than createLine() in auto-layout.
 * FILL width of parent (set AFTER appendChild).
 */
function addDivider(parent) {
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.layoutMode = "HORIZONTAL";
  divider.primaryAxisSizingMode = "AUTO";
  divider.counterAxisSizingMode = "AUTO";
  divider.resize(4, 1); // will be overridden to FILL width
  divider.fills = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  parent.appendChild(divider);
  divider.layoutSizingHorizontal = "FILL"; // FILL AFTER appendChild
}

/**
 * Placeholder for components awaiting design (component = null, no type).
 * Dashed border, shows wireframe_ref + "awaiting for design".
 */
function addPlaceholder(parent, wireframeRef, { width = 228, height = 48 } = {}) {
  const frame = figma.createFrame();
  frame.name = `[placeholder] ${wireframeRef}`;
  frame.resize(width, height);
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisAlignItems = "CENTER";
  frame.counterAxisAlignItems = "CENTER";
  frame.itemSpacing = 2;
  frame.cornerRadius = 6;
  frame.fills = [{ type: "SOLID", color: { r: 0.96, g: 0.96, b: 0.96 } }];
  frame.strokes = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
  frame.strokeWeight = 1;
  frame.dashPattern = [4, 4]; // dashed border — NOT strokeDashes (doesn't exist in API)

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
 * Render a text-only entry (component = null, type = "text").
 * Wraps in a frame so it participates in auto-layout.
 * After appendChild, sets FILL width to fill its parent group.
 */
async function renderTextEntry(parent, entry, { width = 228, height = 32 } = {}) {
  const frame = figma.createFrame();
  frame.name = entry.label || "Text";
  frame.resize(width, height);
  frame.layoutMode = "HORIZONTAL";
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingLeft = 8;
  frame.paddingRight = 8;
  frame.fills = [];
  const t = await styledText(entry.label, entry.textStyle, entry.colorToken);
  frame.appendChild(t);
  parent.appendChild(frame);
  frame.layoutSizingHorizontal = "FILL"; // fill group width AFTER appendChild
  return frame;
}

/**
 * Create a text node bound to DS text style + color variable.
 * Always use this for manually-created text nodes (headings, labels, etc.).
 */
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
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      v
    )];
  } catch (e) { console.warn("Color var import fail:", colorVarKey); }
  return t;
}

/**
 * Log TEXT, BOOLEAN, INSTANCE_SWAP properties of an instance.
 * Only logs once per component key (deduped by _loggedKeys).
 * Run script once, read console output, then hardcode exact prop names into setProps().
 */
const _loggedKeys = new Set();
function logProps(inst, key) {
  if (_loggedKeys.has(key)) return;
  _loggedKeys.add(key);
  const props = Object.entries(inst.componentProperties || {});
  if (!props.length) { console.log(`[${inst.name}] no componentProperties`); return; }
  console.log(`[${inst.name}]:`);
  props
    .filter(([, v]) => ["TEXT", "INSTANCE_SWAP", "BOOLEAN"].includes(v.type))
    .forEach(([name, val]) =>
      console.log(`  · ${name}: ${val.type} = ${JSON.stringify(val.value)}`)
    );
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

main().catch(console.error);
