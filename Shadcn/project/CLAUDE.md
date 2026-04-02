# Figma Design System Workflow

## Mục tiêu
Tự động hóa pipeline: mô tả screen → wireframe → component map → Figma script → chạy qua use_figma MCP → có UI trên Figma.

## Design System
- **Library**: shadcn/ui
- **Figma file key**: `nDt8HbkyoVKOGngzzQgbZs`
- **Cách dùng DS**: File mới + enable shadcn library qua Resources → Libraries

## Workflow (4 bước)

```
[Mô tả screen từ user]
        ↓
Skill 2: Wireframe Planner     → screens/<name>/wireframe.md
        ↓
Skill 3: UI Composer           → screens/<name>/component-map.json
        ↓
Skill 4: Figma Writer          → screens/<name>/figma-script.js
        ↓
use_figma MCP                  → UI xuất hiện trực tiếp trên Figma canvas
```

## Skills
- `skills/wireframe-planner.md` — phân tích yêu cầu → text wireframe có cấu trúc
- `skills/ui-composer.md` — compose screen: map element → shadcn component + variantProps + custom layout spec
- `skills/figma-writer.md` — generate Figma Plugin JS script

## DS Data Files
- `ds/ds-components.json` — 168 component sets với variantOptions + keys (dùng trong ui-composer & figma-writer)
- `ds/ds-variables.json` — 802 variables theo collections (dùng khi cần color token)
- `ds/ds-styles.json` — 310 text styles + 34 effect styles (dùng khi cần text style key)
- `ds/ds-icon-keys.json` — 1469 Lucide icon mappings (dùng trong figma-writer để icon swap)
- `ds/ds-index.json` — file gốc đầy đủ (nguồn để regenerate các file trên nếu DS update)
- `ds/design-skill.md` — quyết định thiết kế + design rules tích lũy theo thời gian

## Screens đã làm
- `screens/fleet-sidebar/` — sidebar navigation (tested, working)

## Khi thêm rule vào bất kỳ skill file nào

Bắt buộc check theo `skills/skill-guide.md` trước khi save:
1. Rule có đủ tổng quát không? (không specific cho 1 component/màn hình)
2. Đã có rule tương tự chưa? → merge thay vì duplicate
3. Đúng layer chưa? (design-skill / figma-writer / ui-composer / wireframe-planner)

## Quy tắc quan trọng

### Figma Script
- Dùng `figma.importComponentSetByKeyAsync(key)` → `.defaultVariant` → `.createInstance()`
- KHÔNG dùng `importComponentByKeyAsync` (cần individual variant key, không phải set key)
- Dùng auto-layout (`layoutMode`, `itemSpacing`, `padding`) thay vì set x/y tay
- Component `null` trong component-map → xem TODO.md (đang redesign custom component spec)

### UI Composer
- Chỉ dùng component có trong `ds-index.json`
- `variantOptions` phải đúng giá trị trong DS — không tự đặt

### Wireframe Planner
- Không đề cập tên shadcn component trong wireframe
- Format: Meta → Layout Structure → Sections → Interactions → States

## Việc đang làm / backlog
Xem `TODO.md`
