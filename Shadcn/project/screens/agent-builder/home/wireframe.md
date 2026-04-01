# Wireframe: Agent Builder — Home

## Meta
- **Mục tiêu màn hình**: Giao diện chat chính để user tương tác với AI agent, chọn tool tích hợp và model
- **Người dùng chính**: Developer / người dùng Fleet platform
- **Layout**: sidebar-left + main content

## Layout Structure
```
┌──────────────┬─────────────────────────────────────────────────────┐
│  Fleet ˅ [≡] │                                                     │
│──────────────│                                                     │
│ 💬 Chat   [3]│                                                     │
│ 📥 Inbox  [3]│                                                     │
│──────────────│              Ask anything                           │
│ My Agents + ˅│                                                     │
│  Create an   │  [doc][🔍][slack][•][⊞][•][X][M]                  │
│  agent...    │                                                     │
│──────────────│  ┌──────────────────────────────────────────────┐  │
│ Explore      │  │ Write your message...                        │  │
│ ⚡ Integration│  │                                              │  │
│ ⊞ Skills     │  │  [+]  Sonnet 4.6 ˅               [🎙] [↑]   │  │
│ ⊟ Templates  │  └──────────────────────────────────────────────┘  │
│ 🤖 Workspace │                                                     │
│──────────────│                                                     │
│ 📖 Docs      │                                                     │
│ ⚙ Settings   │                                                     │
│──────────────│                                                     │
│ [VA] email   │                                                     │
└──────────────┴─────────────────────────────────────────────────────┘
```

## Sections

### Sidebar
**Vị trí**: left, fixed, width 260px, height 100vh
**Mục đích**: Navigation chính của Fleet platform

#### Blocks & Elements
- **Header row**
  - App name "Fleet" + workspace dropdown [icon: ChevronDown]
  - Collapse toggle [icon: PanelLeft]

- **Top nav** (không có label)
  - Chat [icon: MessageSquare] — badge "3", state default
  - Inbox [icon: Inbox] — badge "3", state active

- **My Agents section**
  - Section label "My Agents" với action buttons [icon: Plus] [icon: ChevronDown]
  - Empty state text: "Create an agent to get started" [màu muted]

- **Explore section**
  - Section label "Explore" (không có action)
  - Integrations [icon: Zap]
  - Skills [icon: FileText]
  - Templates [icon: Puzzle]
  - Workspace Agents [icon: Bot]

- **Bottom nav** (không có label)
  - Documentation [icon: BookOpen]
  - Settings [icon: Settings]

- **User block** (bottom, sau divider)
  - Avatar nhỏ (initials fallback, size 24–32px)
  - Email text: "vietanh.ngx29@gmail.com" [màu sidebar-foreground, font-size sm]

---

### Main Content
**Vị trí**: main (right of sidebar), fills remaining width, full height
**Mục đích**: Chat interface — nhập prompt, chọn tools, chọn model

#### Blocks & Elements

- **Center panel** (căn giữa cả ngang + dọc, width 640px)

  - **Heading**: "Ask anything" — text-xl, semibold, màu foreground

  - **Tool selector row** (HORIZONTAL, gap 8px)
    - 8 integration icon buttons: Google Docs, Perplexity, Slack, Linear, Notion, Loom, X/Twitter, Gmail
    - Mỗi icon ~32x32px, hình vuông bo góc
    - **Note**: brand icons ngoài DS → placeholder

  - **Chat input card** (VERTICAL, width 640px, bo góc 12px, border 1px, padding 12px)
    - **Textarea area**: multi-line input, placeholder "Write your message...", auto-grow
    - **Toolbar** (HORIZONTAL, SPACE_BETWEEN):
      - Nhóm trái: nút attach [icon: Plus], model selector "Sonnet 4.6 ˅" [icon: ChevronDown]
      - Nhóm phải: voice [icon: Mic], send [icon: ArrowUp]

## Interactions
- Chat item click → active state (current screen)
- My Agents "+" click → mở flow tạo agent mới
- Tool icon click → toggle tool on/off (active = border highlight)
- Model selector click → dropdown chọn model
- Send / Enter → submit message

## States
- **Empty (default)**: sidebar "Create an agent to get started", chat area trống
- **Tool active**: tool icon button có border highlight
- **Input typing**: textarea expand theo nội dung
