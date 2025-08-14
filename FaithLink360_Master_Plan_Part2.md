<a id="data-model"></a>
## 3. 🗂️ Data Model

### Tables / Entities

#### **Member**
- `id` (UUID, Primary Key)
- `first_name` (String)
- `last_name` (String)
- `email` (String, Unique)
- `phone` (String)
- `date_of_birth` (Date)
- `gender` (Enum: Male, Female, Other)
- `address` (Text)
- `marital_status` (Enum: Single, Married, Divorced, Widowed)
- `spiritual_status` (Enum or Tag)
- `profile_photo_url` (String / URL)
- `notes` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Relationships**
- `groups` → Many-to-Many with `Group`
- `journeys` → One-to-Many with `JourneyStage`
- `care_logs` → One-to-Many with `CareLog`
- `events_attended` → Many-to-Many with `Event`
- `tags` → Many-to-Many with `Tag`
- `family_connections` → Many-to-Many with `Member` (self-referential)

#### **Group**
- `id` (UUID)
- `name` (String)
- `type` (Enum: Ministry, LifeGroup, Team)
- `description` (Text)
- `leader_id` (ForeignKey → Member)
- `created_at` (Timestamp)

**Relationships**
- `members` → Many-to-Many with `Member`
- `files` → One-to-Many with `File`
- `messages` → One-to-Many with `Message`
- `events` → One-to-Many with `Event`

#### **JourneyTemplate**
- `id` (UUID)
- `name` (String)
- `description` (Text)
- `milestones` → One-to-Many with `Milestone`

#### **JourneyStage**
- `id` (UUID)
- `member_id` (ForeignKey → Member)
- `template_id` (ForeignKey → JourneyTemplate)
- `milestone_id` (ForeignKey → Milestone)
- `status` (Enum: Not Started, In Progress, Completed)
- `auto_progress` (Boolean)
- `flag_for_follow_up` (Boolean)

#### **Milestone**
- `id` (UUID)
- `name` (String)
- `description` (Text)
- `sequence` (Integer)
- `template_id` (ForeignKey → JourneyTemplate)

#### **Event**
- `id` (UUID)
- `title` (String)
- `description` (Text)
- `date_time` (Datetime)
- `location` (Text)
- `group_id` (ForeignKey → Group, nullable)
- `tags` (Array or Many-to-Many with `Tag`)
- `calendar_type` (Enum: Weekly, Monthly, One-off)

**Relationships**
- `attendees` → Many-to-Many with `Member`

#### **CareLog**
- `id` (UUID)
- `member_id` (ForeignKey → Member)
- `caregiver_id` (ForeignKey → Member or Admin)
- `type` (Enum: Prayer, Visit, Counseling, Call)
- `notes` (Text)
- `follow_up_required` (Boolean)
- `confidential` (Boolean)
- `created_at` (Timestamp)

#### **Message**
- `id` (UUID)
- `sender_id` (ForeignKey → Admin or Leader)
- `recipient_id` (ForeignKey → Member or Group)
- `channel` (Enum: Email, SMS, In-app)
- `template_id` (ForeignKey → MessageTemplate, optional)
- `subject` (String)
- `body` (Text)
- `status` (Enum: Sent, Opened, Failed)
- `sent_at` (Datetime)

#### **MessageTemplate**
- `id` (UUID)
- `name` (String)
- `channel` (Enum: Email, SMS, In-app)
- `subject` (String)
- `body` (Text)

#### **Tag**
- `id` (UUID)
- `label` (String)
- `category` (Optional: Member, Event, Group, etc.)

#### **File**
- `id` (UUID)
- `group_id` (ForeignKey → Group)
- `file_url` (String / URL)
- `uploaded_by` (ForeignKey → Member)
- `created_at` (Timestamp)

### Relationships Summary
- A `Member` can belong to many `Groups`
- A `Group` can have many `Members`
- A `Member` progresses through `JourneyStages`, based on `JourneyTemplates`
- A `Member` can attend many `Events`
- A `CareLog` is linked to a `Member` and optionally a caregiver
- `Messages` can be sent to `Members` or `Groups`
- `Tags` apply flexibly to `Members`, `Groups`, or `Events`

---

<a id="project-backlog"></a>
## 4. 📋 Project Backlog

### Epics & User Stories

| ID | Epic/Story | Priority | Story Points | Status | Assigned To | Notes |
|----|------------|----------|--------------|--------|-------------|-------|
| **E1** | **Epic: Member Management** | High | - | Not Started | - | - |
| US1.1 | Create and edit detailed member profiles | High | 5 | Not Started | - | - |
| US1.2 | Search for members using tags | Medium | 3 | Not Started | - | - |
| US1.3 | View my own profile as a member | Low | 2 | Not Started | - | - |
| **E2** | **Epic: Spiritual Journey Tracking** | High | - | Not Started | - | - |
| US2.1 | Define spiritual journey templates | High | 5 | Not Started | - | - |
| US2.2 | Assign journey milestones to individuals | High | 3 | Not Started | - | - |
| US2.3 | View analytics on member progression | Medium | 5 | Not Started | - | - |
| **E3** | **Epic: Group Management** | High | - | Not Started | - | - |
| US3.1 | Create and manage group rosters | High | 5 | Not Started | - | - |
| US3.2 | Track attendance for each group meeting | Medium | 3 | Not Started | - | - |
| US3.3 | Share notes and files within groups | Medium | 3 | Not Started | - | - |
| **E4** | **Epic: Communication Center** | Medium | - | Not Started | - | - |
| US4.1 | Send mass messages to members or groups | High | 5 | Not Started | - | - |
| US4.2 | Schedule messages and use templates | Medium | 3 | Not Started | - | - |
| US4.3 | Track message open and delivery rates | Low | 3 | Not Started | - | - |
| **E5** | **Epic: Event Management & Attendance** | Medium | - | Not Started | - | - |
| US5.1 | Create and manage event details | High | 5 | Not Started | - | - |
| US5.2 | Track event check-ins | Medium | 3 | Not Started | - | - |
| US5.3 | View event analytics | Low | 3 | Not Started | - | - |
| **E6** | **Epic: Care Management** | Medium | - | Not Started | - | - |
| US6.1 | Log care visits and prayer requests | High | 5 | Not Started | - | - |
| US6.2 | Assign follow-ups to team members | Medium | 3 | Not Started | - | - |
| US6.3 | Mark notes as confidential | Medium | 2 | Not Started | - | - |
| **E7** | **Epic: Dashboards & Analytics** | Medium | - | Not Started | - | - |
| US7.1 | View dashboards on group health and activity | Medium | 8 | Not Started | - | - |
| US7.2 | Export reports for offline sharing | Low | 3 | Not Started | - | - |
| **E8** | **Epic: UI/UX & Onboarding** | High | - | Not Started | - | - |
| US8.1 | Guided onboarding tooltips | Medium | 5 | Not Started | - | - |
| US8.2 | Responsive mobile interface | High | 8 | Not Started | - | - |
| **E9** | **Epic: Technical & Integrations** | High | - | Not Started | - | - |
| US9.1 | Use low-code platforms (Bubble/OutSystems) | High | 8 | Not Started | - | - |
| US9.2 | Connect external services (Twilio, etc.) | Medium | 5 | Not Started | - | - |
| **E10** | **Epic: Security & Privacy** | High | - | Not Started | - | - |
| US10.1 | Enforce role-based access | High | 5 | Not Started | - | - |
| US10.2 | Profile privacy controls | Medium | 3 | Not Started | - | - |
| **E11** | **Epic: MVP Launch & Pilot** | High | - | Not Started | - | - |
| US11.1 | Test with 5 pilot churches | High | 8 | Not Started | - | - |
| US11.2 | Run QA and user testing | High | 5 | Not Started | - | - |
