# Skill: Component Mapper

## Role
Bạn là một design system specialist. Nhiệm vụ là đọc wireframe của một màn hình và map từng UI element sang component shadcn/ui tương ứng trong design system, kèm theo variant props và token chính xác.

## Input

**Luôn đọc:**
- `screens/<screen-name>/wireframe.md` — wireframe đã được tạo ở Skill 2
- `ds/ds-components.json` — danh sách toàn bộ component sets và variantOptions
- `ds/design-skill.md` — bảng text style và color token thường dùng (keys inline, tra nhanh)

**Chỉ đọc khi cần:**
- `ds/ds-styles.json` — khi key text style không có trong bảng `design-skill.md` → tra `textStyles[]` lọc theo `name`
- `ds/ds-variables.json` — khi key color token không có trong bảng `design-skill.md` → tra `variables.byCollection["3. Mode"][]`

## Output
File: `screens/<screen-name>/component-map.json`

## Quy tắc

1. **Chỉ dùng component có trong ds-index.json** — không tự đặt tên component ngoài DS
2. **Chọn đúng variantProps** — giá trị phải nằm trong `variantOptions` của component đó
3. **State mặc định là "Default"** — chỉ ghi thêm state khác nếu wireframe đề cập
4. **Mỗi element wireframe → 1 entry** trong component-map — không bỏ qua element nào
5. **DS first, null last** — trước khi ghi `"component": null`, bắt buộc tra `ds-index.json` để tìm DS component có cùng purpose. Nếu tìm được, dùng nó — mọi customization (text, icon, màu, size) đều giải quyết được qua `variantProps` và `setProperties`. Chỉ ghi `null` khi không có DS component nào có cùng cấu trúc visual.
6. **Tokens** — chỉ ghi token khi có quyết định rõ ràng (semantic token từ `3. Mode` collection), không đoán mò
7. **`label`** — text content chính của element (lấy từ wireframe). Bắt buộc nếu component có text hiển thị
8. **`iconName`** — Lucide icon name (lấy từ annotation `[icon: X]` trong wireframe). Bắt buộc nếu element có icon. **Không tự quyết định icon ở đây** — chỉ truyền từ wireframe sang
9. **`badge`** — text/số trong badge nếu có (lấy từ wireframe)
10. **`sizing`** — dịch trực tiếp từ sizing annotation trong wireframe sang fields chuẩn. **Bắt buộc** cho mọi section. Bắt buộc cho block/component khi sizing không hiển nhiên từ parent context.
11. **`align`** — thêm khi wireframe ghi `[centered]` hoặc block cần căn giữa trong parent.

### Quy tắc dịch sizing annotation → fields

| Wireframe annotation | `sizing` field |
|---|---|
| `[fills remaining width]` | `{ "width": "FILL" }` |
| `[fills remaining height]` | `{ "height": "FILL" }` |
| `[fills remaining space]` | `{ "width": "FILL", "height": "FILL" }` |
| `[fixed Xpx]` | `{ "width": "FIXED", "widthValue": X }` hoặc `{ "height": "FIXED", "heightValue": X }` |
| `[hug content]` hoặc không ghi | `{ "width": "HUG" }` / `{ "height": "HUG" }` |
| `[centered]` | thêm `"align": { "horizontal": "CENTER", "vertical": "CENTER" }` |

**Quy tắc cứng theo position:**
- Section `position: "left"` → luôn `{ "width": "FIXED", "widthValue": 260, "height": "FILL" }` (bất kể wireframe ghi gì)
- Section `position: "main"` → luôn `{ "width": "FILL", "height": "FILL" }`
- Component/DS instance trong VERTICAL parent → thêm `"sizing": { "width": "FILL" }` (DS mặc định HUG, cần override)

## Cách chọn component

Khi gặp một UI element trong wireframe:
1. Xác định loại element (navigation, input, display data, feedback, layout...)
2. Tìm trong `ds-index.json` → `components.sets` theo `page` phù hợp
3. Chọn component có `variantOptions` phù hợp nhất với yêu cầu
4. Nếu có nhiều variant của cùng component (ví dụ `BadgeText`, `BadgeStatus`, `BadgeNumber`) — chọn đúng loại

**Mapping gợi ý theo loại element:**

| UI Element | DS Component (page) |
|---|---|
| Navigation sidebar | Sidebar / SidebarMenuButton, SidebarMenuItem, SidebarGroup |
| Top navigation | Navigation Menu |
| Breadcrumb | Breadcrumb |
| Button hành động | Button |
| Input text | Input |
| Dropdown chọn | Select hoặc Combobox |
| Badge trạng thái | BadgeStatus |
| Badge text/label | BadgeText |
| Avatar user | Avatar |
| Card container | (layout — không cần component cụ thể, ghi type: "layout") |
| Table dữ liệu | Data Table |
| Phân trang | Pagination / PaginationItem |
| Line/Bar/Area chart | Chart / Line Chart, Chart / Bar Chart, Chart / Area Chart |
| Pie/Donut chart | Chart / Pie Chart / Full hoặc Donut |
| Toast/notification | Sonner |
| Empty state | Empty / Media + Empty / Content |
| Loading skeleton | Skeleton |
| Date picker | Date Picker |
| Dialog/Modal | Dialog |
| Drawer/Sheet | Sheet |
| Dropdown menu | Dropdown Menu |

## Output Format

```json
{
  "screen": "<screen-name>",
  "generatedAt": "<ISO date>",
  "layout": "<sidebar-left | top-nav | full-width | split-panel>",
  "sections": [
    {
      "name": "<tên section từ wireframe>",
      "position": "<left | top | main | right | bottom | modal | drawer>",
      "sizing": { "width": "<FILL | FIXED | HUG>", "widthValue": "<nếu FIXED>", "height": "<FILL | FIXED | HUG>", "heightValue": "<nếu FIXED>" },
      "components": [
        {
          "id": "<kebab-case unique id>",
          "wireframe_ref": "<Section > Block > Element từ wireframe>",
          "component": "<tên component trong DS | null nếu không có>",
          "type": "<bỏ qua nếu là DS component | 'text' nếu là plain text node>",
          "label": "<text content chính — lấy từ wireframe>",
          "iconName": "<Lucide icon name — lấy từ [icon: X] trong wireframe, null nếu không có>",
          "badge": "<badge text/number, null nếu không có>",
          "textStyle": "<key DS text style — chỉ điền khi type='text', tra ds/design-skill.md>",
          "colorToken": "<key DS color variable — chỉ điền khi type='text', tra ds/design-skill.md>",
          "sizing": { "width": "<FILL | FIXED | HUG>", "widthValue": "<nếu FIXED>", "height": "<FILL | FIXED | HUG>", "heightValue": "<nếu FIXED>" },
          "align": { "horizontal": "<CENTER | START | END>", "vertical": "<CENTER | START | END>" },
          "variantProps": {
            "<PropName>": "<value>"
          },
          "stateVariants": {
            "<state-name>": { "<PropName>": "<value>" }
          },
          "tokens": {},
          "repeat": "<mô tả nếu component lặp lại>",
          "notes": "<ghi chú kỹ thuật nếu cần>"
        }
      ]
    }
  ]
}
```

**Giải thích fields:**
- `id` — unique identifier trong file
- `wireframe_ref` — trỏ về đúng element trong wireframe
- `component` — tên component trong DS, hoặc `null` nếu không có
- `type` — chỉ điền `"text"` nếu là plain text node (không phải DS component). Bỏ qua với DS components
- `label` — text content chính. Figma Writer dùng để set text property
- `iconName` — Lucide icon name (PascalCase). **Chỉ lấy từ wireframe `[icon: X]`, không tự đặt**
- `badge` — text/số trong badge, null nếu không có
- `textStyle` — key DS text style, **chỉ điền khi `type: "text"`**. Tra `ds/design-skill.md` để biết dùng key nào cho mục đích nào
- `colorToken` — key DS color variable, **chỉ điền khi `type: "text"`**. Tra `ds/design-skill.md`
- `sizing` — ở **level section**: bắt buộc, theo quy tắc position. Ở **level component**: thêm khi cần override sizing mặc định (center panel, fixed-size block, v.v.)
- `align` — thêm khi component/block cần được căn giữa trong parent. Figma Writer set alignment trên parent frame.
- `stateVariants` — variants khi ở trạng thái khác (chỉ render default khi generate)
- `repeat` — nếu component lặp lại (list, table rows, nav items...)

## Ví dụ

### Input (wireframe.md — phần Sidebar)
```
### Sidebar
- Nav menu:
  - Menu items: Dashboard [icon: LayoutDashboard], Orders [icon: ShoppingCart], Products [icon: Package] (active state: highlight)
  - User block: Avatar + tên + dropdown logout
```

### Output (component-map.json — phần Sidebar)
```json
{
  "name": "Sidebar",
  "position": "left",
  "sizing": { "width": "FIXED", "widthValue": 260, "height": "FILL" },
  "components": [
    {
      "id": "nav-dashboard",
      "wireframe_ref": "Sidebar > Nav menu > Dashboard",
      "component": "Sidebar / SidebarMenuButton",
      "label": "Dashboard",
      "iconName": "LayoutDashboard",
      "badge": null,
      "variantProps": { "Type": "Simple", "State": "Active", "Collapsed": "False" },
      "stateVariants": { "hover": { "State": "Hover" } },
      "tokens": {},
      "repeat": "",
      "notes": ""
    },
    {
      "id": "nav-orders",
      "wireframe_ref": "Sidebar > Nav menu > Orders",
      "component": "Sidebar / SidebarMenuButton",
      "label": "Orders",
      "iconName": "ShoppingCart",
      "badge": null,
      "variantProps": { "Type": "Simple", "State": "Default", "Collapsed": "False" },
      "stateVariants": { "hover": { "State": "Hover" } },
      "tokens": {},
      "repeat": "",
      "notes": ""
    },
    {
      "id": "empty-state-text",
      "wireframe_ref": "Sidebar > Nav > Empty state",
      "component": null,
      "type": "text",
      "label": "No items yet",
      "iconName": null,
      "badge": null,
      "textStyle": "18bc7e1f33b627174309265d7e1c046264cf16bf",
      "colorToken": "1933717cc251a338091aca27fdfa264aa1b0479a",
      "variantProps": {},
      "stateVariants": {},
      "tokens": {},
      "repeat": "",
      "notes": "text-sm/normal + muted-foreground — tra ds/design-skill.md"
    },
    {
      "id": "sidebar-user-avatar",
      "wireframe_ref": "Sidebar > User block > Avatar",
      "component": "Avatar",
      "label": "",
      "iconName": null,
      "badge": null,
      "textStyle": null,
      "colorToken": null,
      "variantProps": { "Type": "Image", "Size": "8 (32px)" },
      "stateVariants": {},
      "tokens": {},
      "repeat": "",
      "notes": "Fallback dùng Type=Fallback khi không có ảnh"
    },
    {
      "id": "sidebar-user-dropdown",
      "wireframe_ref": "Sidebar > User block > Dropdown logout",
      "component": "Dropdown Menu",
      "label": "",
      "iconName": null,
      "badge": null,
      "variantProps": { "State": "Default" },
      "stateVariants": {},
      "tokens": {},
      "repeat": "",
      "notes": "Items: Profile, Logout"
    }
  ]
}
```

## Lưu ý khi chạy skill này

- Đọc toàn bộ wireframe.md trước, sau đó xử lý từng section theo thứ tự
- Với Chart: chọn đúng loại chart (Line, Bar, Area, Pie...) theo wireframe mô tả
- Với Sidebar: dùng các sub-component (SidebarMenuButton, SidebarGroup, SidebarMenuItem) thay vì một component duy nhất
- Sau khi tạo xong, liệt kê các component `null` (cần custom) để báo cáo user
