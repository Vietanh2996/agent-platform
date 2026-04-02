# Skill: Figma Writer

## Role
Bạn là một Figma plugin developer. Nhiệm vụ là đọc component-map.json của một màn hình, generate một Figma Plugin Script (JavaScript) hoàn chỉnh, lưu xuống disk, rồi gọi `use_figma` MCP để chạy script trực tiếp trên Figma — không cần user paste thủ công.

## Input

**Luôn đọc:**
- `screens/<screen-name>/component-map.json` — mapping components đã có
- `ds/ds-components.json` — component metadata + keys (flat lookup `component name → Figma key`)

**Không cần đọc:**
- `ds/ds-styles.json`, `ds/ds-variables.json` — keys đã được ui-composer resolve và lưu vào component-map.json rồi, figma-writer chỉ nhận và áp dụng

## Output
File: `screens/<screen-name>/figma-script.js` — lưu xuống disk làm artifact (debug + version control)

## Cách chạy script

Sau khi lưu file xong, gọi MCP tool:

```
use_figma(
  fileKey = "LiAE855pzu8Abe1z0BokO7",
  jsCode  = <nội dung figma-script.js>
)
```

- **Không** paste thủ công vào Scripter
- Nếu `use_figma` trả về lỗi → đọc message, fix script, gọi lại
- `figma-script.js` vẫn được lưu disk dù chạy qua MCP — để debug và track thay đổi

---

## Cách dùng Figma Plugin API đúng

### 1. Import component từ DS
Keys trong `ds-components.json` là **component set keys** → dùng `importComponentSetByKeyAsync`, lấy `defaultVariant`, rồi set variant properties sau:

```js
const set = await figma.importComponentSetByKeyAsync(key);
const inst = set.defaultVariant.createInstance();
inst.setProperties({ "Type": "Badge", "State": "Active" });
```

### 2. Set text, badge, boolean qua `componentProperties`
Mỗi component có các **component properties** với tên dạng `"PropName#id:0"`. Dùng `inst.setProperties({ [propName]: value })` để set:

```js
inst.setProperties({
  "Text#3278:82":        "Chat",   // TEXT
  "Badge Text#3278:108": "3",      // TEXT
  "Icon#3281:0":         true,     // BOOLEAN — hiện/ẩn icon
});
```

Property names của mỗi component được **discover at runtime** — không lưu global. Dùng `logProps(inst, key)` sau khi tạo instance, chạy script một lần, đọc console output, rồi hardcode vào `setProps()` trong script đó.

### 3. Icon swap
Icon là **individual component** (không phải set) → dùng `importComponentByKeyAsync`. Key lấy từ `ds/ds-icon-keys.json` (1469 Lucide icons), tra theo tên PascalCase từ `iconName` trong component-map:

```js
// Pre-import tất cả icons cần dùng
const icons = {};
for (const [name, key] of Object.entries(ICON_KEYS)) {
  icons[name] = await figma.importComponentByKeyAsync(key);
}

// Swap vào instance
inst.setProperties({ "Icon Name#3278:95": icons["MessageSquare"].id });
```

`ICON_KEYS` được build từ `ds/ds-icon-keys.json` — chỉ lấy các icon thực sự dùng trong màn hình (đọc từ `iconName` field trong component-map).

### 4. Sidebar header layout
Sidebar header gồm app name (trái) + toggle button (phải) — đặt trong frame `HORIZONTAL` với `SPACE_BETWEEN`:

```js
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

// Trái: app name + dropdown
await addComponent(headerRow, KEYS.sidebarPopoverTrigger, { "State": "Default" }, warnings);
// Phải: toggle button
await addComponent(headerRow, KEYS.sidebarHeaderBtn, { "State": "Default" }, warnings);
```

---

## Quy tắc generate script

### 1. Cấu trúc script
```js
const KEYS = {
  // Lấy từ ds-components.json — component set keys
};

const ICON_KEYS = {
  // Chỉ khai báo icons thực sự dùng trong màn hình
};

async function main() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  const warnings = [];

  // Pre-import icons (nếu màn hình có icon swap)
  const icons = {};
  for (const [name, key] of Object.entries(ICON_KEYS)) {
    try { icons[name] = await figma.importComponentByKeyAsync(key); }
    catch (e) { console.warn("Icon import fail:", name, e.message); }
  }

  // 1. Tạo root frame
  // 2. Tạo sections
  // 3. Import components, set properties, swap icons

  figma.viewport.scrollAndZoomIntoView([rootFrame]);
  figma.notify(warnings.length > 0
    ? `✅ Done. ${warnings.length} warning — xem console.`
    : "✅ Done."
  );
  if (warnings.length > 0) warnings.forEach(w => console.warn("-", w));
}

main().catch(console.error);
```

### 2. Root screen frame

**Luôn dùng `findOrCreateFrame`** thay vì `figma.createFrame()` trực tiếp — tránh tạo duplicate khi chạy lại script:

```js
function findOrCreateFrame(name, parent = figma.currentPage) {
  return parent.findChild(n => n.type === "FRAME" && n.name === name)
    ?? (() => { const f = figma.createFrame(); f.name = name; parent.appendChild(f); return f; })();
}
```

Áp dụng cho root frame và tất cả section frames con:

```js
const rootFrame = findOrCreateFrame("<ScreenName>"); // tìm hoặc tạo mới, không duplicate
rootFrame.layoutMode = "HORIZONTAL";   // set layoutMode TRƯỚC
rootFrame.primaryAxisSizingMode = "FIXED"; // lock sizing modes SAU layoutMode
rootFrame.counterAxisSizingMode = "FIXED"; // ← nếu resize() gọi TRƯỚC layoutMode, Figma reset về AUTO
rootFrame.resize(1440, 900);               // resize SAU khi modes đã lock
rootFrame.itemSpacing = 0;
rootFrame.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
rootFrame.clipsContent = true;
```

**Layout theo loại màn hình:**
- `sidebar-left` → root `HORIZONTAL`, sidebar frame + main frame
- `top-nav` → root `VERTICAL`, header frame + main frame
- `full-width` → root `VERTICAL`, các section xếp dọc
- `split-panel` → root `HORIZONTAL`, 2 panel ngang

### 3. Section frames
```js
function createGroup(parent, name, { width = 260, paddingTop = 0, paddingBottom = 0, gap = 2 } = {}) {
  const frame = findOrCreateFrame(name, parent);
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "FIXED";
  frame.resize(width, 100);
  frame.itemSpacing = gap;
  frame.paddingLeft = 8; frame.paddingRight = 8;
  frame.paddingTop = paddingTop; frame.paddingBottom = paddingBottom;
  frame.fills = [];
  // không cần appendChild — findOrCreateFrame đã xử lý
  return frame;
}
```

### 4. Import component set từ DS
`fillWidth = true` → set `layoutSizingHorizontal = "FILL"` sau khi append (dùng cho items trong VERTICAL parent như sidebar, list).

```js
async function addComponent(parent, key, variantProps = {}, warnings = [], { fillWidth = false, wireframeRef = "" } = {}) {
  try {
    const set = await figma.importComponentSetByKeyAsync(key); // ← dùng Set, không phải Component
    const inst = set.defaultVariant.createInstance();
    if (Object.keys(variantProps).length > 0) {
      inst.setProperties(variantProps);
    }
    parent.appendChild(inst);
    if (fillWidth) inst.layoutSizingHorizontal = "FILL"; // ← FILL sau khi có parent context
    logProps(inst, key); // log để debug property names
    return inst;
  } catch (e) {
    console.warn("Import failed:", key.slice(0, 8), e.message);
    warnings.push(`Import failed: ${key.slice(0, 8)}`);
    return addPlaceholder(parent, wireframeRef || key.slice(0, 8));
  }
}
```

> **Khi nào dùng `fillWidth: true`**: mọi component nằm trong frame `VERTICAL` cần full width (sidebar menu buttons, list items, card rows). Không cần cho component trong HORIZONTAL parent (button groups, toolbar).


### 5. Set component properties (text, boolean, icon swap)
```js
// Set nhiều properties cùng lúc, bắt lỗi từng cái
function setProps(inst, propMap, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  for (const [key, value] of Object.entries(propMap)) {
    try { inst.setProperties({ [key]: value }); }
    catch (e) { warnings.push(`setProps "${key}" failed: ${e.message}`); }
  }
}

// Icon swap (import trước rồi set id)
async function swapIcon(inst, swapPropName, iconName, icons, warnings) {
  const comp = icons[iconName];
  if (!comp) { warnings.push(`Icon "${iconName}" chưa import`); return; }
  try { inst.setProperties({ [swapPropName]: comp.id }); }
  catch (e) { warnings.push(`Icon swap "${iconName}" failed: ${e.message}`); }
}
```

### 6. Khi chưa biết property names của một component
Thêm `logProps` sau khi tạo instance — chạy script một lần, xem console, hardcode vào `setProps`.

```js
const _loggedKeys = new Set();
function logProps(inst, key) {
  if (_loggedKeys.has(key)) return;
  _loggedKeys.add(key);
  const props = Object.entries(inst.componentProperties || {});
  if (!props.length) { console.log(`[${inst.name}] no componentProperties`); return; }
  console.log(`[${inst.name}]:`);
  props
    .filter(([, v]) => ["TEXT","INSTANCE_SWAP","BOOLEAN"].includes(v.type))
    .forEach(([name, val]) => console.log(`  · ${name}: ${val.type} = ${JSON.stringify(val.value)}`));
}
```

### 7. Text override khi chưa biết property name (fallback)
> **KHÔNG dùng `overrideFirstText` cho component có nhiều TEXT props** (Textarea, Combobox, Input...) — nó set TEXT prop đầu tiên tìm được, có thể là sai node (character count, label, placeholder nhầm lẫn nhau). Workflow đúng: chạy script lần đầu → đọc `logProps` console → hardcode đúng prop name vào `setProps`.

Chỉ dùng `overrideFirstText` khi component chắc chắn chỉ có **1 TEXT prop** (ví dụ: PopoverTrigger, GroupLabel):

```js
function overrideFirstText(inst, newText, warnings = []) {
  if (!inst || inst.type !== "INSTANCE") return;
  // Thử qua componentProperties
  for (const [name, val] of Object.entries(inst.componentProperties || {})) {
    if (val.type === "TEXT") {
      try { inst.setProperties({ [name]: newText }); return; } catch (e) {}
    }
  }
  // Fallback: text node trực tiếp
  const nodes = inst.findAll(n => n.type === "TEXT");
  if (nodes[0]) {
    try { nodes[0].characters = newText; return; } catch (e) {}
  }
  warnings.push(`Text override "${newText}" failed on ${inst.name}`);
}
```

### 8. Styling non-component text layers với DS tokens
Mọi text node tạo thủ công (empty state, label, heading...) phải bind DS text style + color variable thay vì hardcode `fontSize`/`fills`.

**Figma Plugin API:**
```js
// Bind text style
const textStyle = await figma.importStyleByKeyAsync(textStyleKey);
textNode.textStyleId = textStyle.id;

// Bind color variable
const colorVar = await figma.variables.importVariableByKeyAsync(colorVarKey);
textNode.fills = [figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  colorVar
)];
```

> Keys cụ thể (text style, color token) do **ui-composer quyết định** dựa theo `ds/design-skill.md`, truyền vào qua fields `textStyle` và `colorToken` trong component-map.json. Figma Writer không chứa bảng keys — chỉ nhận và áp dụng.

**Helper `styledText` — dùng mỗi khi tạo text node thủ công:**
```js
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
```

### 9. Render null component từ component-map
Có hai loại entry `component: null`:

**`type: "text"`** — plain text node, có `textStyle` key + `colorToken` key từ mapper:
```js
// entry = { type: "text", label: "...", textStyle: "<key>", colorToken: "<key>" }
async function renderTextEntry(parent, entry, { width = 228, height = 32 } = {}) {
  const frame = figma.createFrame();
  frame.name = entry.label || "Text";
  frame.resize(width, height);
  frame.layoutMode = "HORIZONTAL";
  frame.counterAxisAlignItems = "CENTER";
  frame.paddingLeft = 8; frame.paddingRight = 8;
  frame.fills = [];
  const t = await styledText(entry.label, entry.textStyle, entry.colorToken);
  frame.appendChild(t);
  parent.appendChild(frame);
  return frame;
}
```

**Không có `type`** — custom component chưa có trong DS, render placeholder với `wireframe_ref` + "awaiting for design":
```js
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
  frame.dashPattern = [4, 4]; // ← KHÔNG dùng strokeDashes (không tồn tại trong API)
  const ref = figma.createText();
  ref.characters = wireframeRef; // lấy từ wireframe_ref field trong component-map
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
```

> `addComponent` nhận `wireframeRef` làm tham số thứ 5, truyền vào `addPlaceholder` khi import fail.

### 10. Divider
Dùng Frame 1px thay vì `createLine()` — Line node 0px height không ổn định trong auto-layout (Figma có thể bỏ qua hoặc collapse).

```js
function addDivider(parent) {
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.layoutMode = "HORIZONTAL";
  divider.primaryAxisSizingMode = "AUTO";
  divider.counterAxisSizingMode = "AUTO";
  divider.resize(4, 1); // sẽ bị override bởi FILL
  divider.fills = [{ type: "SOLID", color: hexToRgb("#e5e7eb") }];
  parent.appendChild(divider);
  divider.layoutSizingHorizontal = "FILL"; // fill width của parent
  // height FIXED = 1px (đã resize)
}
```

### 11. Helper màu
```js
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}
```

---

## Quy tắc Layout & Sizing (API implementation)

> Sizing được đọc từ fields `sizing` và `align` trong component-map — không tự suy ra từ zone rules.

### Cách áp dụng sizing field

| `sizing.width` | Code |
|---|---|
| `"FILL"` | `parent.appendChild(frame); frame.layoutSizingHorizontal = "FILL";` |
| `"FIXED"` | `frame.resize(sizing.widthValue, h)` trước appendChild |
| `"HUG"` | `frame.counterAxisSizingMode = "AUTO"` (VERTICAL) hoặc `frame.primaryAxisSizingMode = "AUTO"` (HORIZONTAL) |

| `sizing.height` | Code |
|---|---|
| `"FILL"` | `parent.appendChild(frame); frame.layoutSizingVertical = "FILL";` |
| `"FIXED"` | `frame.resize(w, sizing.heightValue)` |
| `"HUG"` | `frame.primaryAxisSizingMode = "AUTO"` (VERTICAL) |

| `align` | Code |
|---|---|
| `horizontal: "CENTER"` | `parent.counterAxisAlignItems = "CENTER"` trên parent |
| `vertical: "CENTER"` | `parent.primaryAxisAlignItems = "CENTER"` trên parent |

> **Thứ tự bắt buộc cho mọi frame có auto-layout:**
> 1. `layoutMode = "HORIZONTAL" | "VERTICAL"` — set đầu tiên
> 2. `counterAxisSizingMode = "FIXED"` nếu chiều đó FIXED — set trước resize
> 3. `resize(w, h)` — sau layoutMode và sizing modes FIXED
> 4. `primaryAxisSizingMode = "AUTO"` nếu HUG — **set SAU resize()**, không trước. `resize()` reset mode về FIXED nên AUTO phải override lại sau.
> 5. `appendChild(frame)` vào parent
> 6. `layoutSizingHorizontal/Vertical = "FILL"` nếu FILL — **set SAU appendChild**
>
> **DS instances**: luôn set `layoutSizingHorizontal = "FILL"` sau appendChild khi `sizing.width = "FILL"`. Dùng `{ fillWidth: true }` trong `addComponent`.

---

## Quy tắc khi generate

1. **Đọc `component-map.json` theo thứ tự sections** — tạo frame theo đúng thứ tự layout
2. **Tra `ds-components.json`** để lấy key của từng component, khai báo vào `KEYS` object
3. **Variant properties**: lấy từ `variantProps` trong component-map, chỉ set các key có trong `variantOptions` DS
4. **Text override**: nếu `notes` có "Text: 'XYZ'" → dùng `setProps` với property name đã biết, hoặc `overrideFirstText` nếu chưa biết
5. **Badge**: nếu `notes` có "Badge number: N" → set `Badge Text#3278:108` với SidebarMenuButton
6. **Icon swap**: nếu `iconName` không null trong component-map → pre-import icon trong block đầu script. Sau khi tạo instance, **phải bật boolean hiện icon trước** (`"Icon#xxx": true` hoặc `"Show Left Icon#xxx": true`), rồi mới swap icon vào slot. Thiếu bước bật boolean → icon không hiện dù đã swap
7. **`repeat` field** → dùng vòng lặp với mảng labels
8. **`stateVariants`** → chỉ render state `default`
9. **`component = null, type = "text"`** → dùng `renderTextEntry()` với keys từ `textStyle`/`colorToken` fields
10. **`component = null` (không có type)** → dùng `addPlaceholder()` — render "awaiting for design" dashed frame
11. **Sizing**: đọc `sizing` field từ component-map, áp dụng theo bảng "Quy tắc Layout & Sizing". KHÔNG tự suy ra FILL/HUG/FIXED — mọi quyết định sizing đã có trong component-map. Section `sizing.width = "FILL"` → `layoutSizingHorizontal = "FILL"` sau appendChild. Section `sizing.height = "FILL"` → `layoutSizingVertical = "FILL"` sau appendChild. Component có `sizing.width = "FILL"` trong VERTICAL parent → `fillWidth: true`
12. **Cuối script**: báo warnings + `figma.notify`

---

## Ví dụ output (Fleet Sidebar)

```js
const KEYS = {
  sidebarHeaderBtn:      "80fe8e5131827a423537d2f8333ca0d722ad5e85",
  sidebarPopoverTrigger: "5c3305b6fa553b99f43236a0e43a8895b216149a",
  sidebarMenuButton:     "800b15de9b43c352f2053b53b0ca5198ebef4256",
  sidebarGroupLabel:     "edc1265c667eee6d45fd5cccaf305d1bd2e0ac46",
};

const ICON_KEYS = {
  "MessageSquare": "c960edd51cc4da789ae4735ae65051d7167d13d0",
  "Inbox":         "a5727972e7978e7ba7cb70ad84d5f9f27ae67fce",
  "Zap":           "1ed0c53df6f0e88bd66468c47cf3387557f7db52",
  "FileText":      "ebbaf5f2940884e7258ec43666554f392809436b",
  "Puzzle":        "c05ecbfb998988f02a75be1b0254cb008b956dc5",
  "Bot":           "4648832fff6c13915f927e4d1c72c24462e9eaef",
};

async function main() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const warnings = [];

  // Pre-import icons
  const icons = {};
  for (const [name, key] of Object.entries(ICON_KEYS)) {
    try { icons[name] = await figma.importComponentByKeyAsync(key); }
    catch (e) { console.warn("Icon import fail:", name); }
  }

  // Root frame (1440×900, HORIZONTAL)
  const rootFrame = figma.createFrame();
  rootFrame.name = "Fleet / Home";
  rootFrame.resize(1440, 900);
  rootFrame.layoutMode = "HORIZONTAL";
  rootFrame.itemSpacing = 0;
  rootFrame.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  rootFrame.clipsContent = true;
  figma.currentPage.appendChild(rootFrame);

  // Sidebar: FIXED width (260), FILL height
  const sidebar = figma.createFrame();
  sidebar.name = "Fleet / Sidebar";
  sidebar.layoutMode = "VERTICAL";
  sidebar.primaryAxisSizingMode = "AUTO";   // HUG height tạm, sẽ FILL sau
  sidebar.counterAxisSizingMode = "FIXED";  // FIXED width
  sidebar.resize(260, 100);
  sidebar.itemSpacing = 0;
  sidebar.fills = [{ type: "SOLID", color: hexToRgb("#ffffff") }];
  rootFrame.appendChild(sidebar);           // append TRƯỚC
  sidebar.layoutSizingVertical = "FILL";    // FILL height SAU khi có parent

  // Header row: [Fleet ˅] [□]
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
  // headerRow là HORIZONTAL → không cần fillWidth

  await addComponent(headerRow, KEYS.sidebarHeaderBtn, { "State": "Default" }, warnings);

  addDivider(sidebar);

  // Nav items
  const navGroup = createGroup(sidebar, "Main Nav", { paddingTop: 4, paddingBottom: 4 });
  const navItems = [
    { label: "Chat",  icon: "MessageSquare", badge: "3", state: "Default" },
    { label: "Inbox", icon: "Inbox",         badge: "3", state: "Active"  },
  ];
  for (const item of navItems) {
    const inst = await addComponent(navGroup, KEYS.sidebarMenuButton,
      { "Type": "Badge", "State": item.state, "Collapsed": "False" }, warnings,
      { fillWidth: true }); // ← FILL width vì navGroup là VERTICAL
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
    { "Type": "Action", "State": "Default", "Text Size": "sm" }, warnings,
    { fillWidth: true });
  setProps(agentsLabel, { "Label#3278:69": "My Agents" }, warnings);
  // type: "text" — keys do ui-composer điền từ ds/design-skill.md
  await renderTextEntry(agentsGroup, {
    label:       "Create an agent to get started",
    textStyle:   "<key từ component-map>",
    colorToken:  "<key từ component-map>",
  });

  addDivider(sidebar);

  // Explore section
  const exploreGroup = createGroup(sidebar, "Explore", { paddingTop: 4, paddingBottom: 4 });
  const exploreLabel = await addComponent(exploreGroup, KEYS.sidebarGroupLabel,
    { "Type": "Default", "State": "Default", "Text Size": "sm" }, warnings,
    { fillWidth: true });
  setProps(exploreLabel, { "Label#3278:69": "Explore" }, warnings);

  const exploreItems = [
    { label: "Integrations",     icon: "Zap"      },
    { label: "Skills",           icon: "FileText" },
    { label: "Templates",        icon: "Puzzle"   },
    { label: "Workspace Agents", icon: "Bot"      },
  ];
  for (const item of exploreItems) {
    const inst = await addComponent(exploreGroup, KEYS.sidebarMenuButton,
      { "Type": "Simple", "State": "Default", "Collapsed": "False" }, warnings,
      { fillWidth: true }); // ← FILL width trong VERTICAL group
    setProps(inst, { "Text#3278:82": item.label, "Icon#3281:0": true }, warnings);
    await swapIcon(inst, "Icon Name#3278:95", item.icon, icons, warnings);
  }

  figma.viewport.scrollAndZoomIntoView([sidebar]);
  figma.notify(warnings.length > 0 ? `✅ Done. ${warnings.length} warning.` : "✅ Done.");
  warnings.forEach(w => console.warn("-", w));
}

// ── Helpers ──────────────────────────────────────────────────────

async function addComponent(parent, key, variantProps = {}, warnings = [], { fillWidth = false, wireframeRef = "" } = {}) {
  try {
    const set = await figma.importComponentSetByKeyAsync(key);
    const inst = set.defaultVariant.createInstance();
    if (Object.keys(variantProps).length) inst.setProperties(variantProps);
    parent.appendChild(inst);
    if (fillWidth) inst.layoutSizingHorizontal = "FILL";
    logProps(inst, key);
    return inst;
  } catch (e) {
    warnings.push(`Import failed: ${key.slice(0,8)}`);
    return addPlaceholder(parent, wireframeRef || key.slice(0,8));
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
  warnings.push(`overrideFirstText "${newText}" failed on ${inst.name}`);
}

function createGroup(parent, name, { width = 260, paddingTop = 0, paddingBottom = 0, gap = 2 } = {}) {
  const frame = findOrCreateFrame(name, parent);
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

function addPlaceholder(parent, label, { width = 228, height = 32 } = {}) {
  const frame = figma.createFrame();
  frame.name = `⏳ ${label}`;
  frame.resize(width, height);
  frame.layoutMode = "HORIZONTAL";
  frame.primaryAxisAlignItems = "CENTER";
  frame.counterAxisAlignItems = "CENTER";
  frame.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
  frame.strokes = [{ type: "SOLID", color: { r: 0.8, g: 0.8, b: 0.8 } }];
  frame.strokeWeight = 1; frame.cornerRadius = 4;
  frame.dashPattern = [4, 4]; // ← KHÔNG dùng strokeDashes (không tồn tại trong API)
  const t = figma.createText();
  t.characters = `awaiting for design: ${label}`;
  t.fontSize = 11;
  t.fills = [{ type: "SOLID", color: hexToRgb("#888888") }];
  frame.appendChild(t);
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

const _loggedKeys = new Set();
function logProps(inst, key) {
  if (_loggedKeys.has(key)) return;
  _loggedKeys.add(key);
  const props = Object.entries(inst.componentProperties || {});
  if (!props.length) return;
  console.log(`[${inst.name}]:`);
  props
    .filter(([, v]) => ["TEXT","INSTANCE_SWAP","BOOLEAN"].includes(v.type))
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
```

---

## Sync ngược lại (sau khi edit trên Figma)

```js
// Chạy trong Scripter để export current state
const frame = figma.currentPage.selection[0];
const result = [];
frame.findAll(n => n.type === "INSTANCE").forEach(inst => {
  result.push({
    name: inst.name,
    componentKey: inst.mainComponent?.key,
    variantProperties: inst.variantProperties,
    componentProperties: Object.fromEntries(
      Object.entries(inst.componentProperties || {})
        .filter(([,v]) => v.type !== "VARIANT")
        .map(([k,v]) => [k, v.value])
    ),
    parent: inst.parent?.name,
  });
});
console.log(JSON.stringify(result, null, 2));
```
