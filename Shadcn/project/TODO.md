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
  - Quản lý vòng đời: ai tạo, ai update, khi nào promote từ inline → snowflake
  - Quyết định: cùng file hay file riêng trong Figma?

- [ ] **Flow mode — tạo hàng loạt UI + nối screens**
  - Nhận danh sách screens trong 1 lần chạy → generate tuần tự
  - Dùng Figma connector API nối frames thành user flow hoàn chỉnh
  - Layout tự động: screens xếp theo hàng ngang, arrow có label (action/event)

- [ ] **Batch feedback — sửa hàng loạt theo feedback**
  - Nhận feedback dạng text → xác định screen + element bị ảnh hưởng
  - Re-run chỉ phần thay đổi (findOrCreateFrame để không tạo duplicate)
  - Áp dụng feedback thành rule vào skill file tương ứng nếu mang tính tổng quát

## Backlog / Future

- [ ] **Text override** trong component instances chưa test đầy đủ (nav item labels vẫn là default DS)
