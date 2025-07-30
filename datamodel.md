# 🗂️ FaithLink360 Data Model

## 📄 Tables / Entities

---

### **Member**
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

---

### **Group**
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

---

### **JourneyTemplate**
- `id` (UUID)
- `name` (String)
- `description` (Text)
- `milestones` → One-to-Many with `Milestone`

---

### **JourneyStage**
- `id` (UUID)
- `member_id` (ForeignKey → Member)
- `template_id` (ForeignKey → JourneyTemplate)
- `milestone_id` (ForeignKey → Milestone)
- `status` (Enum: Not Started, In Progress, Completed)
- `auto_progress` (Boolean)
- `flag_for_follow_up` (Boolean)

---

### **Milestone**
- `id` (UUID)
- `name` (String)
- `description` (Text)
- `sequence` (Integer)
- `template_id` (ForeignKey → JourneyTemplate)

---

### **Event**
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

---

### **CareLog**
- `id` (UUID)
- `member_id` (ForeignKey → Member)
- `caregiver_id` (ForeignKey → Member or Admin)
- `type` (Enum: Prayer, Visit, Counseling, Call)
- `notes` (Text)
- `follow_up_required` (Boolean)
- `confidential` (Boolean)
- `created_at` (Timestamp)

---

### **Message**
- `id` (UUID)
- `sender_id` (ForeignKey → Admin or Leader)
- `recipient_id` (ForeignKey → Member or Group)
- `channel` (Enum: Email, SMS, In-app)
- `template_id` (ForeignKey → MessageTemplate, optional)
- `subject` (String)
- `body` (Text)
- `status` (Enum: Sent, Opened, Failed)
- `sent_at` (Datetime)

---

### **MessageTemplate**
- `id` (UUID)
- `name` (String)
- `channel` (Enum: Email, SMS, In-app)
- `subject` (String)
- `body` (Text)

---

### **Tag**
- `id` (UUID)
- `label` (String)
- `category` (Optional: Member, Event, Group, etc.)

---

### **File**
- `id` (UUID)
- `group_id` (ForeignKey → Group)
- `file_url` (String / URL)
- `uploaded_by` (ForeignKey → Member)
- `created_at` (Timestamp)

---

## 🧩 Relationships Summary

- A `Member` can belong to many `Groups`
- A `Group` can have many `Members`
- A `Member` progresses through `JourneyStages`, based on `JourneyTemplates`
- A `Member` can attend many `Events`
- A `CareLog` is linked to a `Member` and optionally a caregiver
- `Messages` can be sent to `Members` or `Groups`
- `Tags` apply flexibly to `Members`, `Groups`, or `Events`

