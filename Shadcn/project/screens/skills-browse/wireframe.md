# Wireframe: Skills / Browse Library

## Meta
- **Mục tiêu màn hình**: Cho phép user xem danh sách skills của workspace và browse pre-built skills từ thư viện
- **Người dùng chính**: Workspace member
- **Layout**: sidebar-left

## Layout Structure

```
┌──────────────┬────────────────────────────────────────────────────┐
│              │  Page Header: Skills + actions                     │
│   Sidebar    ├────────────────────────────────────────────────────┤
│   (nav,      │  Content Bar: search + filter + view toggle        │
│   Skills     ├────────────────────────────────────────────────────┤
│   active)    │                                                    │
│              │         [empty / skill list area]                  │
│              │                                                    │
│              │    ┌──────────────────────────────────────┐        │
│              │    │  Modal: Skill Library                │        │
│              │    │  ┌───────────┬──────────────────────┐│        │
│              │    │  │ Left Nav  │  3-col skill grid    ││        │
│              │    │  └───────────┴──────────────────────┘│        │
│              │    └──────────────────────────────────────┘        │
│   [bottom]   │                                                    │
│   Doc/Set/   │                                                    │
│   User       │                                                    │
└──────────────┴────────────────────────────────────────────────────┘
```

## Sections

### Sidebar [fixed 260px width, fills remaining height]
**Vị trí**: left
**Mục đích**: Navigation chính — giống màn Home, Skills ở trạng thái Active

#### Blocks & Elements
- **Header block**
  - App name dropdown: "Fleet" [icon: ChevronsUpDown]
  - Collapse toggle button [icon: PanelLeft]
- **Top nav group**
  - Chat [icon: MessageSquare] — badge số 3
  - Inbox [icon: Inbox] — badge số 3
- **My Agents group** (label + action)
  - Label: "My Agents"
  - Empty state text: "Create an agent to get started"
- **Explore group** (label only)
  - Label: "Explore"
  - Integrations [icon: Zap] — state Default
  - Skills [icon: FileText] — **state Active**
  - Templates [icon: Puzzle] — state Default
  - Workspace Agents [icon: Bot] — state Default
- **Spacer** — fills remaining height, pushes bottom block to bottom
- **Bottom nav group**
  - Documentation [icon: BookOpen]
  - Settings [icon: Settings]
- **User block**
  - Avatar fallback: "VA"
  - Email: "vietanh.ngx29@gmail.com"

---

### Page Header [fills remaining width, hug content height]
**Vị trí**: top of main content
**Mục đích**: Tiêu đề trang + quick actions

#### Blocks & Elements
- **Left: Title block**
  - Icon [icon: FileText] — small, muted color
  - Title text: "Skills" — heading size
  - Subtitle text: "Skills shared across all agents in this workspace" — muted, small
- **Right: Action buttons**
  - "Browse Library" button — outline/secondary variant [icon: BookOpen]
  - "+ Create Skill" button — primary variant, with dropdown arrow [icon: ChevronDown] on right

---

### Content Bar [fills remaining width, hug content height]
**Vị trí**: below page header
**Mục đích**: Filter và điều hướng danh sách skills

#### Blocks & Elements
- **Left: Search + filter**
  - Search input field: placeholder "Search..." [icon: Search] — fixed ~200px width
  - Filter dropdown: "All Skills" với dropdown indicator — shows filter options khi click
- **Right: View toggle**
  - Grid view toggle button [icon: LayoutGrid] — active state
  - List view toggle button [icon: List]

---

### Skills List Area [fills remaining space]
**Vị trí**: main content area
**Mục đích**: Hiển thị danh sách skills hiện có (empty state trong màn này)

#### Blocks & Elements
- **State hiện tại**: không có skill nào — area trống (background #fafafa)
- *(Skill cards sẽ xuất hiện khi có data)*

---

### Skill Library Modal [fixed ~700px width, fixed ~560px height, centered]
**Vị trí**: modal overlay, centered trên main content
**Mục đích**: Browse và chọn pre-built skills từ thư viện

#### Blocks & Elements
- **Modal container** — white background, rounded-xl, subtle shadow, border
  - **Modal Header**
    - Icon [icon: Library] — small
    - Title: "Skill Library"
    - Subtitle: "Browse pre-built skills"

  - **Modal Body** — horizontal split: Left panel + Right panel

  - **Left Panel** [fixed ~160px width, fills height]
    - Search input: placeholder "Search..." — full width
    - Active filter pill: "All" — selected/active state
    - Category list label: "CATEGORIES" — uppercase, muted, tiny
    - Category items (plain text, clickable):
      - Research
      - Sales
      - Productivity
      - Marketing
      - Product

  - **Right Panel** [fills remaining width, fills height, scrollable]
    - 3-column grid of skill cards, gap 1px (border-separated)
    - **Skill Card** [hug content]:
      - Icon [icon: FileText] — small, muted
      - Title: skill name — medium weight
      - Description: 2 lines max, truncated with "..." — muted, small
    - Skills shown (11 cards visible + partial scroll):
      1. Deep Research — "Multi-pass research workflow with cited sources — decomposes questions, searche..."
      2. Account Briefing — "Pre-meeting account intelligence brief combining calendar context, email history,..."
      3. Email Triage — "Classify unread emails by urgency, draft responses for routine items, escalate..."
      4. Marketing Psychology — "Apply psychological principles, mental models, and behavioral science to marketin..."
      5. Copywriting — "Write, rewrite, or improve marketing copy for any page — homepage, landing, pricing,..."
      6. Cold Email — "Write B2B cold emails and follow-up sequences that get replies — subject lines,..."
      7. SEO Audit — "Audit, review, or diagnose SEO issues — technical SEO, on-page optimization, conte..."
      8. Content Strategy — "Plan what content to create, build topic clusters, design editorial calendars, and..."
      9. Social Content — "Create engaging social media content for LinkedIn, Twitter/X, Instagram — hook..."
      10. Competitive Analysis — "Understand and respond to competition using frameworks from 49 product leaders —..."
      11. Defining Product Vision — "Create compelling product visions using insights from 101 product leaders — vision v..."
      12. Writing PRDs — "Write effective product requirements documents — PR/FAQ method, success..."

## Interactions
- "Browse Library" button click → mở Skill Library modal
- Modal category click → filter skill grid theo category
- Modal search input → filter theo tên/mô tả skill
- Skill card click → (TBD: preview / add to workspace)
- Click ngoài modal → đóng modal
- "Create Skill" button click → navigate đến màn Create Skill
- "+ Create Skill" dropdown arrow → dropdown menu: "Create from scratch", "Import"
- View toggle grid/list → switch layout của skills list
- Filter "All Skills" → dropdown chọn filter

## States
- **Empty** (màn này): Skills list area trống — chưa có skill nào
- **Modal open**: overlay mờ nhẹ phía sau modal
- **Loading**: skeleton cards trong modal grid
- **Category active**: category item trong left panel highlight
