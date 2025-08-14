# 🎨 FaithLink360 Design Foundation

## Design System Specifications

### Color Palette
```
Primary Colors:
- Primary Blue: #4A90E2 (Trust, spirituality)
- Primary Dark: #2E5C8A (Headers, navigation)
- Primary Light: #E8F4FD (Background accents)

Secondary Colors:
- Success Green: #7ED321 (Completed milestones, positive actions)
- Warning Orange: #F5A623 (Needs attention, follow-ups)
- Error Red: #D0021B (Urgent care needs, errors)

Neutral Colors:
- Text Primary: #333333 (Main text)
- Text Secondary: #666666 (Supporting text)
- Text Light: #999999 (Disabled, placeholders)
- Background: #FFFFFF (Main background)
- Background Light: #F8F9FA (Section backgrounds)
- Border: #E1E5E9 (Dividers, form borders)
```

### Typography
```
Primary Font: 'Inter' (Clean, modern, highly readable)
Fallbacks: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

Hierarchy:
- H1 (Page Titles): 32px, Bold
- H2 (Section Headers): 24px, Semibold  
- H3 (Sub-sections): 20px, Semibold
- H4 (Card Titles): 18px, Medium
- Body Text: 16px, Regular
- Small Text: 14px, Regular
- Caption: 12px, Regular
```

### Spacing System
```
Base Unit: 8px

Spacing Scale:
- xs: 4px
- sm: 8px  
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px
- xxxl: 64px
```

### Component Library

#### Buttons
```
Primary Button:
- Background: #4A90E2
- Text: White, 16px, Medium
- Padding: 12px 24px
- Border-radius: 6px
- Hover: #2E5C8A

Secondary Button:
- Background: Transparent
- Border: 2px solid #4A90E2
- Text: #4A90E2, 16px, Medium
- Padding: 10px 22px
- Border-radius: 6px

Danger Button:
- Background: #D0021B
- Text: White, 16px, Medium
- Padding: 12px 24px
- Border-radius: 6px
```

#### Cards
```
Standard Card:
- Background: #FFFFFF
- Border: 1px solid #E1E5E9
- Border-radius: 8px
- Padding: 24px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
```

---

## Key Screen Wireframes

### 1. Dashboard (Admin View)
```
┌─────────────────────────────────────────────────────────────┐
│ [🏠 FaithLink360]    [Search Members...]    [👤 Admin ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Sidebar ──┐  ┌─── Main Content ─────────────────────┐    │
│ │ 📊 Dashboard│  │ 📈 Quick Stats                      │    │
│ │ 👥 Members  │  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │    │
│ │ 👨‍👩‍👧‍👦 Groups   │  │ │ 487 │ │ 23  │ │ 15  │ │ 8   │    │
│ │ 🌱 Journeys │  │ │Total│ │New  │ │Need │ │Care │    │    │
│ │ 📅 Events   │  │ │Memb.│ │This │ │Fol. │ │Flag │    │    │
│ │ 💬 Messages │  │ └─────┘ │Week │ │Up   │ └─────┘    │    │
│ │ ❤️ Care     │  │         └─────┘ └─────┘            │    │
│ │ 📊 Reports  │  │                                     │    │
│ │             │  │ 📋 Recent Activity                  │    │
│ │             │  │ • John Smith completed baptism     │    │
│ │             │  │ • Sarah Jones joined Life Group    │    │
│ │             │  │ • Mike Wilson needs follow-up      │    │
│ │             │  │                                     │    │
│ │             │  │ 👥 Group Health Overview            │    │
│ │             │  │ [Group engagement chart]            │    │
│ └─────────────┘  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2. Member Directory
```
┌─────────────────────────────────────────────────────────────┐
│ [🏠 FaithLink360]    [Search Members...]    [👤 Admin ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Sidebar ──┐  ┌─── Member Directory ──────────────────┐   │
│ │ 📊 Dashboard│  │ 👥 Members (487)     [+ Add Member]  │   │
│ │ 👥 Members  │  │                                      │   │
│ │ 👨‍👩‍👧‍👦 Groups   │  │ Filters: [All ▼] [New ▼] [Tag ▼]      │   │
│ │ 🌱 Journeys │  │ Sort: [Name ▼]                       │   │
│ │ 📅 Events   │  │                                      │   │
│ │ 💬 Messages │  │ ┌────────────────────────────────────┐ │   │
│ │ ❤️ Care     │  │ │ [📷] John Smith                    │ │   │
│ │ 📊 Reports  │  │ │      john@email.com | 📞 555-0123  │ │   │
│ │             │  │ │      🏷️ New Believer, Follow-up    │ │   │
│ │             │  │ │      👥 Life Group Alpha          │ │   │
│ │             │  │ └────────────────────────────────────┘ │   │
│ │             │  │ ┌────────────────────────────────────┐ │   │
│ │             │  │ │ [📷] Sarah Wilson                  │ │   │
│ │             │  │ │      sarah@email.com | 📞 555-0124 │ │   │
│ │             │  │ │      🏷️ Leader, Active             │ │   │
│ │             │  │ │      👥 Youth Ministry             │ │   │
│ │             │  │ └────────────────────────────────────┘ │   │
│ └─────────────┘  └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Member Profile Detail
```
┌─────────────────────────────────────────────────────────────┐
│ [🏠 FaithLink360]    [Search Members...]    [👤 Admin ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Sidebar ──┐  ┌─── John Smith Profile ───────────────┐    │
│ │ 📊 Dashboard│  │ ┌─ Basic Info ─┐ ┌─ Journey Status ─┐ │    │
│ │ 👥 Members  │  │ │ [📷] John    │ │ 🌱 New Believer  │ │    │
│ │ 👨‍👩‍👧‍👦 Groups   │  │ │ Smith        │ │ Progress: 2/5   │ │    │
│ │ 🌱 Journeys │  │ │              │ │ ✅ Welcome      │ │    │
│ │ 📅 Events   │  │ │ 📧 john@     │ │ ✅ Bible Study  │ │    │
│ │ 💬 Messages │  │ │ email.com    │ │ ⏳ Baptism      │ │    │
│ │ ❤️ Care     │  │ │ 📞 555-0123  │ │ ⭕ Membership   │ │    │
│ │ 📊 Reports  │  │ │              │ │ ⭕ Leadership   │ │    │
│ │             │  │ │ 🏷️ New      │ │                 │ │    │
│ │             │  │ │ Believer     │ │ 🚩 Flag for     │ │    │
│ │             │  │ │ Follow-up    │ │ Follow-up       │ │    │
│ │             │  │ └──────────────┘ └─────────────────┘ │    │
│ │             │  │                                      │    │
│ │             │  │ ┌─── Recent Activity ──────────────┐ │    │
│ │             │  │ │ • Attended Sunday Service (8/3)  │ │    │
│ │             │  │ │ • Joined Life Group Alpha (7/30) │ │    │
│ │             │  │ │ • Completed Bible Study (7/25)   │ │    │
│ │             │  │ └───────────────────────────────────┘ │    │
│ │             │  │                                      │    │
│ │             │  │ ┌─── Care History ─────────────────┐ │    │
│ │             │  │ │ 📞 Pastor Mike - Phone Call      │ │    │
│ │             │  │ │     "Welcome conversation" (7/28)│ │    │
│ │             │  │ │ [+ Add Care Note]                │ │    │
│ │             │  │ └───────────────────────────────────┘ │    │
│ └─────────────┘  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 4. Group Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ [🏠 FaithLink360]    [Search Members...]    [👤 Admin ▼]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Sidebar ──┐  ┌─── Groups Overview ──────────────────┐    │
│ │ 📊 Dashboard│  │ 👨‍👩‍👧‍👦 Groups (12)      [+ New Group]  │    │
│ │ 👥 Members  │  │                                      │    │
│ │ 👨‍👩‍👧‍👦 Groups   │  │ ┌──────────────────────────────────┐ │    │
│ │ 🌱 Journeys │  │ │ Life Group Alpha                 │ │    │
│ │ 📅 Events   │  │ │ Leader: Sarah Wilson             │ │    │
│ │ 💬 Messages │  │ │ Members: 8/12 👥                │ │    │
│ │ ❤️ Care     │  │ │ Attendance: 75% 📊              │ │    │
│ │ 📊 Reports  │  │ │ Last Meeting: Aug 2              │ │    │
│ │             │  │ └──────────────────────────────────┘ │    │
│ │             │  │ ┌──────────────────────────────────┐ │    │
│ │             │  │ │ Youth Ministry                   │ │    │
│ │             │  │ │ Leader: Mike Johnson             │ │    │
│ │             │  │ │ Members: 15/20 👥               │ │    │
│ │             │  │ │ Attendance: 82% 📊              │ │    │
│ │             │  │ │ Last Meeting: Aug 4              │ │    │
│ │             │  │ └──────────────────────────────────┘ │    │
│ └─────────────┘  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 5. Mobile-Responsive Design
```
┌─────────────────────┐
│ 🏠 FaithLink360  ☰ │
├─────────────────────┤
│ 📊 Dashboard        │
│                     │
│ ┌─ Quick Stats ───┐ │
│ │ 487  23  15   8 │ │
│ │Total New Flg Care│ │
│ └─────────────────┘ │
│                     │
│ 📋 Recent Activity  │
│ • John completed... │
│ • Sarah joined...   │
│ • Mike needs...     │
│                     │
│ 👥 Group Health     │
│ [Chart thumbnail]   │
│                     │
│ ┌─── Quick Actions ─┐│
│ │ [+ Member]        ││
│ │ [+ Event]         ││
│ │ [📧 Message]      ││
│ └───────────────────┘│
└─────────────────────┘
```

## Design Principles

### 1. Church-Focused Design
- Warm, welcoming colors that reflect spiritual themes
- Clear hierarchy for pastoral and administrative functions  
- Family-friendly iconography and language

### 2. Accessibility
- WCAG 2.1 AA compliance
- High contrast ratios (minimum 4.5:1)
- Keyboard navigation support
- Screen reader compatibility

### 3. Mobile-First Approach
- Touch-friendly interface (minimum 44px tap targets)
- Responsive breakpoints: 320px, 768px, 1024px, 1440px
- Progressive enhancement for larger screens

### 4. Data Density Balance
- Information-rich for admins without overwhelming
- Scannable lists with clear visual hierarchy
- Progressive disclosure for detailed information

### 5. Onboarding & Usability
- Contextual help and tooltips
- Clear call-to-action buttons
- Consistent navigation patterns
- Error prevention and clear error messages

## Figma Design File Structure
```
📁 FaithLink360 Design System
├── 🎨 Design Tokens (Colors, Typography, Spacing)
├── 🔧 Components (Buttons, Cards, Forms, Navigation)
├── 📱 Mobile Screens
├── 💻 Desktop Screens
├── 🔄 User Flows
└── 📋 Style Guide
```

## Next Steps for Design Implementation
1. Set up Figma workspace with design system
2. Create detailed wireframes for all 7 core modules
3. Design user flow diagrams
4. Create interactive prototype for user testing
5. Prepare design handoff documentation for Bubble.io implementation
