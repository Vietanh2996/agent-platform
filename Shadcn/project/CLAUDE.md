# Figma Design System Workflow

## Mục tiêu
Tự động hóa pipeline: mô tả screen → wireframe → component map → Figma script → paste vào Scripter plugin → có UI trên Figma.

## Design System
- **Library**: shadcn/ui
- **Figma file key**: `LiAE855pzu8Abe1z0BokO7`
- **Cách dùng DS**: File mới + enable shadcn library qua Resources → Libraries

## Workflow (4 bước)

```
[Mô tả screen từ user]
        ↓
Skill 2: Wireframe Planner     → screens/<name>/wireframe.md
        ↓
Skill 3: Component Mapper      → screens/<name>/component-map.json
        ↓
Skill 4: Figma Writer          → screens/<name>/figma-script.js
        ↓
[User paste vào Scripter plugin trong Figma → chạy → UI xuất hiện]
```

## Skills
- `skills/wireframe-planner.md` — phân tích yêu cầu → text wireframe có cấu trúc
- `skills/component-mapper.md` — map element → shadcn component + variantProps
- `skills/figma-writer.md` — generate Figma Plugin JS script

## DS Data Files
- `ds/ds-index.json` — 168 component sets với variantOptions, 802 variables, 310 text styles, 34 effect styles
- `ds/ds-keys.json` — flat lookup `component name → Figma key` (dùng trong figma-writer)
- `ds/design-decisions.md` — quyết định thiết kế tích lũy theo thời gian

## Screens đã làm
- `screens/fleet-sidebar/` — sidebar navigation (tested, working)

## Quy tắc quan trọng

### Figma Script
- Dùng `figma.importComponentSetByKeyAsync(key)` → `.defaultVariant` → `.createInstance()`
- KHÔNG dùng `importComponentByKeyAsync` (cần individual variant key, không phải set key)
- Dùng auto-layout (`layoutMode`, `itemSpacing`, `padding`) thay vì set x/y tay
- Component `null` trong component-map → `addPlaceholder()` với label rõ ràng

### Component Mapper
- Chỉ dùng component có trong `ds-index.json`
- `variantOptions` phải đúng giá trị trong DS — không tự đặt

### Wireframe Planner
- Không đề cập tên shadcn component trong wireframe
- Format: Meta → Layout Structure → Sections → Interactions → States

## Vấn đề đang mở
- Text override trong component instances chưa test (text label của nav items vẫn là default từ DS)
- Bridge plugin (real-time Claude ↔ Figma) chưa build — dùng paste-run trước
- ds-index.json còn lớn (~8600 lines) — cân nhắc tách ds-variables.json + ds-styles.json sau
