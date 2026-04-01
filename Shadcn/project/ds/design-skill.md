# Design Skill — Shadcn/UI Design System

Đây là nơi tích lũy kỹ năng thiết kế cho pipeline Wireframe → Component Map → Figma. Mỗi quyết định thiết kế được compact thành rule có thể áp dụng trực tiếp.

Wireframe và Component Mapper đọc file này để đưa ra quyết định. Figma Writer không đọc file này — nó chỉ nhận keys đã được quyết định từ component-map.json.

---

## Text Style — Khi nào dùng gì

Format tên style trong DS: `text-{size}/leading-{type}/{weight}`

| Mục đích | Style name | Key |
|---|---|---|
| Body text, mô tả, placeholder | `text-sm/leading-normal/normal` | `18bc7e1f33b627174309265d7e1c046264cf16bf` |
| Label, nav item, tên mục | `text-sm/leading-normal/medium` | `b38a907677508f128d9a0c54b3f47c9931b3f910` |
| Section title, heading nhỏ | `text-sm/leading-normal/semibold` | `5626b770669ffbf7048f2fc2730c9f5f3cbc900b` |
| Caption, metadata, timestamp | `text-xs/leading-normal/normal` | `845e2807d7bd156cd78a7dc1a9d57c3ae578e309` |
| Caption medium | `text-xs/leading-normal/medium` | `006730eaa0f3ba116dc4881634a5dcd69333cb84` |

> Tra key đầy đủ trong `ds/ds-index.json` → `textStyles[]` → lọc theo `name`.

---

## Color Token — Khi nào dùng gì

Tất cả từ collection `3. Mode` trong DS.

| Mục đích | Token name | Key | Hex (shadcn default) |
|---|---|---|---|
| Text mặc định | `base/foreground` | `aab20ced11a334856ec9331cf98dd2f1637ff70a` | `#09090b` |
| Text mờ, placeholder, empty state | `base/muted-foreground` | `1933717cc251a338091aca27fdfa264aa1b0479a` | `#71717a` |
| Text trong sidebar | `base/sidebar-foreground` | `f73d9ec93a3682484e8af69077eaba20d5406a66` | `#09090b` |
| Text trên nền primary | `base/primary-foreground` | `bd71fae51edb466b06deb0f4cf7c1403b87963e9` | `#fafafa` |
| Background mặc định | `base/background` | `41ae341e2a8c738b58666f48c3417066cca83b29` | `#ffffff` |
| Background muted (tag, chip) | `base/muted` | `113e689019a8f3e232297f4fdaee4c0098e3f4c2` | `#f4f4f5` |

> Tra key đầy đủ trong `ds/ds-index.json` → `variables.byCollection["3. Mode"][]`.
> **Trong Figma script**: dùng cột Hex — KHÔNG dùng key với `figma.variables` API (không reliable trong Scripter). Xem rule trong `figma-writer.md`.

---

## Layout Patterns

### Sidebar
- **Width**: 260px cố định
- **Header row**: frame `HORIZONTAL`, `SPACE_BETWEEN`, `counterAxisAlignItems: CENTER`, padding `8/4/4/4` (left/right/top/bottom)
  - Trái: `Sidebar / PopoverTrigger` (app name + dropdown)
  - Phải: `Sidebar / Header Button` (toggle icon)
- **Section group**: frame `VERTICAL`, `paddingTop/Bottom: 4`, `paddingLeft/Right: 8`, `itemSpacing: 2`
- **Divider**: giữa các section, full width (260px)
- **Background**: trắng `#ffffff`, stroke phải `#e5e7eb` 1px

### Spacing
- Section padding: 4px top/bottom
- Item spacing trong group: 2px
- Sidebar padding ngoài: 0 left/right, 0 top, 8 bottom

---

## Icon Selection

- **Chỉ dùng Lucide icons** — tra tại https://lucide.dev
- **Quyết định ở Wireframe** — ghi `[icon: IconName]` vào element description
- **Format**: PascalCase (e.g., `MessageSquare`, `Bot`, `FileText`)
- **Keys**: tra trong `ds/ds-icon-keys.json` theo tên icon

**Nguyên tắc chọn icon:**
- Icon phản ánh chức năng, không trang trí
- Ưu tiên icon quen thuộc (Mail cho inbox, Bot cho agent...)
- Nhất quán trong cùng một section (cùng family nếu có)

