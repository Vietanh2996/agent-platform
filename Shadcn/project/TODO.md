# TODO — Figma Workflow

## Đang làm

- [ ] **figma-writer.md — use_figma MCP integration**
  - Đổi section "Cách chạy script" → hướng dẫn gọi `use_figma(fileKey, jsCode)`
  - Thêm pattern `findOrCreateFrame(name)` — update frame cũ thay vì tạo mới
  - (Role đã update ở commit e5455ab)

## Cần làm

- [ ] **Test end-to-end** pipeline với screen `agent-builder/home` sau khi xong use_figma integration

- [ ] **Custom component spec format**
  - Bỏ `type: "text"` top-level — text phải là `children` của custom component
  - `component: null` → bắt buộc có `type: "custom"` + `layout` + `children` spec đầy đủ
  - Update ui-composer.md + figma-writer.md (thay `addPlaceholder` bằng `renderCustomComponent`)

- [ ] **Snowflake component system** *(cần thiết kế thêm)*
  - Registry `ds/snowflake-components.json` — lưu spec custom components tái sử dụng (vd: Sidebar)
  - UI Composer reference `snowflake:ComponentName` thay vì spec lại từ đầu
  - Figma Writer render từ snowflake spec + wrap thành Figma component
  - Quyết định: cùng file hay file riêng trong Figma?

## Backlog / Future

- [ ] **Text override** trong component instances chưa test đầy đủ (nav item labels vẫn là default DS)
