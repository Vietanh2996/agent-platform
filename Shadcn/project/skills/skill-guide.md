# Skill Guide — Cách cải tiến hệ thống

## Mục đích
File này định nghĩa quy trình chuẩn để chuyển feedback thành rule. Áp dụng đồng đều cho mọi layer — kỹ thuật hay thiết kế đều cùng một process.

---

## Kiến trúc 4 layers

| Layer | File | Loại rule |
|---|---|---|
| Design spec | `wireframe-planner.md` | Cách mô tả UI: cấu trúc layout, icon annotation, states |
| Mapping logic | `component-mapper.md` | Cách map element → DS component, khi nào dùng null |
| Design knowledge | `design-skill.md` | Quyết định thiết kế: khi nào và tại sao dùng pattern/style/token nào — key có thể đi kèm nếu là một phần của rule |
| API / Drawing | `figma-writer.md` | Cách dùng Figma Plugin API, helpers, cấu trúc script |

Mỗi feedback thuộc về đúng một layer. Nếu cùng lúc fail nhiều layer → tách thành nhiều rules riêng.

---

## Phân loại feedback trước khi xử lý

Hai loại feedback khác nhau hoàn toàn — phải xác định đúng loại trước khi làm:

| Loại | Dấu hiệu | Xử lý |
|---|---|---|
| **Sửa hệ thống** | "Cách tiếp cận sai", "rule thiếu", "luôn bị lỗi này" | Cập nhật skill file → áp dụng cho mọi màn hình sau |
| **Vẽ lại thiết kế** | "Màn hình này cần thay đổi", "layout chỗ này chưa đúng" | Cập nhật wireframe/component-map/script của screen đó |

**Design feedback có thể thành system rule nếu generalizable:**
- "Màn hình home này nút send màu sai" → vẽ lại, không thành rule
- "Nút primary action luôn dùng default variant" → thành rule trong design-skill.md

---

## Quy trình chuẩn

```
Feedback từ output thực tế
        ↓
1. Xác định layer nào fail
        ↓
2. Viết rule tổng quát tại layer đó
        ↓
3. Test rule: "Nếu rule này tồn tại trước, có ngăn được bug không?"
        ↓
4. Nếu đã có rule gần: merge hoặc thay thế — không duplicate
        ↓
5. Add vào file đúng layer
```

---

## Cách viết rule đúng

**Rule tốt**: tổng quát, cover cả class of bugs, không phải một instance.

**Rule xấu** → **Rule tốt**:
- ~~"Dùng `dashPattern` thay `strokeDashes`"~~ → "Mọi property gán lên Figma node phải là property hợp lệ trong Plugin API — không đoán tên"
- ~~"Sonnet 4.6 dùng Button, không phải null"~~ → "DS first, null last — tra ds-index.json trước khi ghi component: null"
- ~~"Heading dùng text-xl/semibold"~~ → "Heading chính của màn hình dùng text-xl/semibold + foreground token"

**Dấu hiệu rule còn quá specific:**
- Rule chỉ đúng cho một component cụ thể
- Rule chỉ đúng cho một màn hình cụ thể
- Rule có tên riêng của element trong đó (Button, Textarea, Sonnet...)

---

## Test rule

Một rule đủ tổng quát khi trả lời được cả 3:

1. **Ngăn được bug gốc không?** — nếu không, rule sai layer hoặc sai scope
2. **Áp dụng được cho trường hợp tương tự chưa gặp không?** — nếu không, rule vẫn còn quá hẹp
3. **Có conflict với rule hiện có không?** — nếu có, merge hoặc xoá rule cũ

---

## Khi nào merge, khi nào thêm mới

- **Merge**: rule mới bao trùm rule cũ → xoá rule cũ, giữ rule mới tổng quát hơn
- **Thêm mới**: rule mới cover trường hợp khác hoàn toàn, không overlap
- **Không duplicate**: cùng một nguyên tắc không được ghi ở 2 chỗ khác nhau

---

## Ví dụ đầy đủ

### Case 1 — Mapping logic fail

**Feedback**: "Model selector hiện ra placeholder dù DS có Button"

**Phân loại**: Sửa hệ thống (mapper luôn sai với pattern này, không chỉ màn hình này)

**Xác định layer**: `component-mapper.md` — quyết định mapping sai

**Draft rule**: "Button có Show Left/Right Icon nên dùng được cho model selector"

**Test**: chỉ đúng với model selector → còn quá specific

**Refine**: "DS first, null last — tra ds-index.json trước khi ghi component: null. Mọi customization (text, icon, size) đều giải quyết được qua variantProps và setProperties"

**Test lại**:
1. Ngăn được bug gốc? ✓
2. Áp dụng cho trường hợp tương tự? ✓ (bất kỳ element nào bị đánh null sai)
3. Conflict rule cũ? Rule cũ là "ghi null nếu không tìm thấy" → merge, thay thế

**Add vào**: Rule 5 trong `component-mapper.md`

---

### Case 2 — API layer fail

**Feedback**: "Main content crash hoàn toàn, không render được"

**Phân loại**: Sửa hệ thống (dùng sai API property, sẽ gặp lại ở mọi màn hình)

**Xác định layer**: `figma-writer.md` — dùng sai Figma Plugin API

**Draft rule**: "Dùng `dashPattern` thay `strokeDashes`"

**Test**: chỉ fix một property name → còn quá specific

**Refine**: "Mọi property gán lên Figma node phải là property hợp lệ trong Plugin API — không đoán tên property"

**Test lại**:
1. Ngăn được bug gốc? ✓
2. Áp dụng cho trường hợp tương tự? ✓ (strokeAlign, strokeCap, và bất kỳ property nào khác)
3. Conflict rule cũ? Không có rule nào về vấn đề này → thêm mới

**Add vào**: `addPlaceholder` helper trong `figma-writer.md`, kèm comment cảnh báo

---

### Case 3 — Vẽ lại thiết kế (không thành rule)

**Feedback**: "Màn hình home này heading 'Ask anything' quá nhỏ"

**Phân loại**: Vẽ lại thiết kế — chỉ ảnh hưởng màn hình này

**Xử lý**: Cập nhật `wireframe.md` + `component-map.json` + `figma-script.js` của screen đó

**Không thành rule** vì: quyết định size là per-screen, không phải pattern chung

**Ngoại lệ — thành rule nếu**: feedback là "heading chính của mọi màn hình nên dùng text-xl/semibold" → add vào `design-skill.md`
