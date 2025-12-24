# Software Requirements Specification (SRS)
# Campii Connect - Social Experience @ Camp

**Privacy-First Social Feature for Campers**

- **Version:** 1.0
- **Date:** 20 December 2568
- **Prepared by:** Campy Product Team

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Feature Overview](#2-feature-overview)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [UI Specifications](#5-ui-specifications)
6. [Empty & Edge States](#6-empty--edge-states)
7. [Host Control Features](#7-host-control-features)
8. [Data Requirements](#8-data-requirements)
9. [Privacy & Security](#9-privacy--security-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)

---

## 1. Introduction

### 1.1 Purpose
Campii Connect คือฟีเจอร์ Social แบบ Privacy-first ที่ช่วยให้ผู้เข้าพักในแคมป์เดียวกัน เชื่อมต่อ พูดคุย และทำกิจกรรมร่วมกัน เฉพาะช่วงเวลาที่เข้าพักจริงเท่านั้น

### 1.2 Positioning Statement
> "Campii Connect helps campers connect naturally during their stay through safe, anonymous, and consent-based social experiences."

### 1.3 Key Principles

| Principle | Description |
|-----------|-------------|
| **Social Focus** | เน้น Social / Activity / Community เท่านั้น - ไม่ใช่ Dating / Matchmaking |
| **Privacy-First** | ข้อมูลทั้งหมดเป็น Anonymous + Aggregate, PDPA-safe by design |
| **Consent-Based** | ทุกการ interaction ต้องผ่าน permission |
| **Time-Bound** | ใช้ได้เฉพาะ Active Booking, ข้อมูลหมดอายุอัตโนมัติหลัง checkout |
| **Host Control** | Camp Host เป็นผู้ควบคุมบรรยากาศ สามารถ enable/disable ได้ |

### 1.4 What This Feature Does NOT Do
- Dating / Matching
- แสดง Relationship status
- DM ตรงโดยไม่มี consent
- Group chat
- Image / Link sharing
- External contact exchange
- Social feed ระยะยาว
- เก็บข้อมูลหลัง checkout

### 1.5 Definitions

| Term | Definition |
|------|------------|
| **Campii** | ผู้เข้าพักที่ Check-in แล้วในแคมป์ |
| **Open to Jam** | สถานะที่ผู้ใช้ประกาศว่าพร้อมเชื่อมต่อกับคนอื่น (รายวัน) |
| **Intent** | ความต้องการในการเชื่อมต่อ (Chill, Activity, Walk, Music, etc.) |
| **Tent Vibe** | ข้อมูล Aggregate ระดับ Tent/Zone |
| **Quiet Hours** | ช่วงเวลาที่ Host กำหนดให้ปิดฟีเจอร์ชั่วคราว |
| **Privacy Threshold** | จำนวนขั้นต่ำที่ต้องมีก่อนแสดงข้อมูล (≥5 คน) |
| **Say Hi** | Action สำหรับเริ่มต้นสนทนากับ Campii อื่น |

---

## 2. Feature Overview

### 2.1 Core Features

| Feature | Description | Key Elements |
|---------|-------------|--------------|
| **Camp Today** | Entry point แสดงข้อมูลรวมของแคมป์วันนี้ | Campii count, Avg age range, Trip types (aggregate) |
| **Open to Jam** | ปุ่มประกาศสถานะพร้อมเชื่อมต่อ | Intent selection (5 options), Daily reset, Manual off |
| **Campii Connect** | แสดง Campii ที่ Open to Jam | Campii cards, Say Hi CTA, No swipe gestures |
| **Tent Vibe** | ข้อมูล Anonymous ระดับ Tent | Group size, Age range, Gender ratio, Trip types |
| **Social Chat** | Text-only chat 1:1 | Consent-based, Auto-close after checkout + 24h |

### 2.2 User Flow
1. Camper Check-in → เข้าถึง Camp Today page
2. ดู Camp Overview (aggregate data)
3. กด "Open to Jam" → เลือก Intent
4. เห็น Campii อื่นที่ Open to Jam
5. กด "Say Hi" → รอ Accept
6. Chat (Text-only)
7. Checkout → ข้อมูลหมดอายุหลัง 24 ชม.

### 2.3 Access Control

| User State | Can Access? | Note |
|------------|-------------|------|
| Not logged in | No | ต้อง Login |
| Logged in, no booking | No | ต้องมี Active Booking |
| Has booking, not checked-in | No | ต้อง Check-in แล้ว |
| Checked-in (Active) | **Yes** | Full access |
| After checkout | No | หมดสิทธิ์เข้าถึง |

---

## 3. User Stories

### 3.1 Camper Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-001 | As a camper, I want to see how many people are at the camp today so I know the vibe | แสดง Campii count, avg age, trip types |
| US-002 | As a camper, I want to indicate I'm open to connect without revealing personal info | Open to Jam with intent selection |
| US-003 | As a camper, I want to see who else is open to connect and their interests | Campii cards with intent chips |
| US-004 | As a camper, I want to initiate a chat with consent | Say Hi → Wait for accept |
| US-005 | As a camper, I want my data to be deleted after checkout | Auto-delete after checkout + 24h |
| US-006 | As a camper, I want to turn off my open status anytime | Manual close button |
| US-007 | As a camper, I want to see tent-level insights without identifying individuals | Aggregate data with privacy threshold |

### 3.2 Camp Host Stories

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-101 | As a host, I want to enable/disable Campii Connect for my camp | Toggle in Host Dashboard |
| US-102 | As a host, I want to set quiet hours when the feature is disabled | Quiet Hours settings |
| US-103 | As a host, I want an emergency kill switch if issues arise | Immediate disable button |
| US-104 | As a host, I want to limit daily interactions per user | Max interactions setting |

---

## 4. Functional Requirements

### 4.1 Camp Today Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-CT-001 | Header Display | แสดง Camp name + Date: Today + Subtext 'Visible only during your stay' | High |
| FR-CT-002 | Campii Count | แสดงจำนวน Campii ที่ Check-in วันนี้ (👥 icon) | High |
| FR-CT-003 | Avg Age Range | แสดง Age range แบบ aggregate (เช่น 30-39) (🎂 icon) | High |
| FR-CT-004 | Trip Types | แสดง Trip type distribution ด้วย icons (🧍 Solo, 👥 Friends, 👨‍👩‍👧 Family) | High |
| FR-CT-005 | Privacy Caption | แสดง 'Aggregated, anonymous data only' ใต้ stats | High |
| FR-CT-006 | Access Control | แสดงเฉพาะผู้ที่ Check-in แล้วเท่านั้น | High |

### 4.2 Open to Jam Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-OJ-001 | Primary CTA Button | ปุ่ม '🔥 Open to Jam?' เป็น Sticky ที่ด้านล่าง | High |
| FR-OJ-002 | Helper Text | แสดง 'Let others know you're open to chat or activities today' | High |
| FR-OJ-003 | Bottom Sheet | เปิด Bottom Sheet เมื่อกด พร้อมหัวข้อ 'Today, you're open to…' | High |
| FR-OJ-004 | Intent Options | 5 ตัวเลือก: ☕ Chill & chat, 🔥 Join activities, 🥾 Walk/explore, 🎸 Music/Jam, 👀 Just open | High |
| FR-OJ-005 | Single Select | เลือกได้ 1 Intent เท่านั้น | High |
| FR-OJ-006 | Confirm Button | ปุ่ม 'Open for today' เพื่อยืนยัน | High |
| FR-OJ-007 | Daily Reset | สถานะ reset อัตโนมัติเมื่อสิ้นสุดวัน (00:00) | High |
| FR-OJ-008 | Manual Close | ผู้ใช้ปิดสถานะได้ทันทีด้วยตัวเอง | High |
| FR-OJ-009 | Success Toast | แสดง '🟢 You're open to jam today' หลังยืนยัน | Medium |

### 4.3 Campii Connect Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-CC-001 | Section Header | แสดง 'Campii who are open today' พร้อม count badge | High |
| FR-CC-002 | Horizontal Scroll | Campii cards แสดงแบบ Horizontal scroll | High |
| FR-CC-003 | Campii Card - Avatar | แสดง Avatar (icon หรือ blurred image) | High |
| FR-CC-004 | Campii Card - Nickname | แสดง Nickname (ไม่ใช่ชื่อจริง) | High |
| FR-CC-005 | Campii Card - Tent Label | แสดง Tent/Zone (เช่น Tent A) | Medium |
| FR-CC-006 | Campii Card - Status | แสดง 🟢 Open to Jam badge | High |
| FR-CC-007 | Campii Card - Intent | แสดง Intent chip (เช่น 🔥 BBQ) | High |
| FR-CC-008 | Campii Card - Group Size | แสดง Avg group size (เช่น 2.2) | Medium |
| FR-CC-009 | Campii Card - Trip Type | แสดง Trip type icon (👥 Friends) | Medium |
| FR-CC-010 | Say Hi CTA | ปุ่ม 'Say Hi' สำหรับเริ่มสนทนา | High |
| FR-CC-011 | No Swipe | ไม่มี swipe gestures (avoid dating vibe) | High |

### 4.4 Tent Vibe Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-TV-001 | Section Header | แสดง 'Tent Vibe Today' | High |
| FR-TV-002 | Tent Card - Name | แสดง Tent name + 🟢 Active today badge | High |
| FR-TV-003 | Tent Card - Group Size | แสดง 👥 Avg group size (เช่น 2.2) | High |
| FR-TV-004 | Tent Card - Age Range | แสดง 🎂 Avg age (เช่น 30-39) | High |
| FR-TV-005 | Tent Card - Gender Ratio | แสดง 🚻 Gender ratio เฉพาะเมื่อ ≥5 คน | Medium |
| FR-TV-006 | Tent Card - Trip Types | แสดง Trip type bar (icons + ~%) | Medium |
| FR-TV-007 | See Campii CTA | ลิงก์ 'See Campii in this tent →' | Medium |
| FR-TV-008 | Privacy Helper | แสดง 'Shown only when enough campers are present' | High |
| FR-TV-009 | Privacy Threshold | ซ่อนข้อมูลถ้าจำนวนคน < 5 | High |

### 4.5 Social Chat Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-SC-001 | Consent Request | เมื่อกด Say Hi → ส่ง request ไปยังอีกฝ่าย | High |
| FR-SC-002 | Accept/Decline | ผู้รับ Accept หรือ Decline ได้ | High |
| FR-SC-003 | Text-Only Chat | Chat เป็น text เท่านั้น ไม่มี image/link | High |
| FR-SC-004 | 1:1 Only | ไม่มี Group chat | High |
| FR-SC-005 | Auto Close | Chat ปิดอัตโนมัติหลัง checkout + 24 ชม. | High |
| FR-SC-006 | Block User | ผู้ใช้ Block อีกฝ่ายได้ | High |
| FR-SC-007 | Report | ผู้ใช้ Report inappropriate behavior ได้ | High |
| FR-SC-008 | No Contact Exchange | ระบบไม่อำนวยความสะดวกในการแลกเปลี่ยน contact ภายนอก | High |

---

## 5. UI Specifications

### 5.1 Design Rules (LOCKED)
- Mobile-first, single-page scroll
- No swipe gestures (avoid dating vibe)
- Icon > Text (Icon-first approach)
- Colors: Green / Neutral only
- Bottom sheets for actions
- Text-only chat
- Chat auto-closes after checkout + 24h

### 5.2 Page Structure

| Section | Components |
|---------|------------|
| Header | Camp name + 'Today' + Subtext |
| Camp Overview Card | Stats row (Campii count, Age, Trip types) + Privacy caption |
| Open to Jam CTA | Sticky button + Helper text + Bottom sheet |
| Campii Section | Section header + Count badge + Horizontal scroll cards |
| Tent Vibe Section | Section header + Vertical tent cards |

### 5.3 Component Specifications

#### 5.3.1 Camp Overview Card
| Property | Value |
|----------|-------|
| Width | Full width |
| Background | White with subtle shadow |
| Stats Layout | Horizontal row with icons |
| Icons | 👥 Campii / 🎂 Age / 🧭 Trip types |
| Caption | Gray text, small size |

#### 5.3.2 Open to Jam Button
| Property | Value |
|----------|-------|
| Position | Sticky bottom |
| Style | Primary green, rounded, 🔥 emoji prefix |
| State: Default | '🔥 Open to Jam?' |
| State: Active | '🟢 You're open' + Close button |
| Helper Text | Gray, below button |

#### 5.3.3 Campii Card
| Property | Value |
|----------|-------|
| Layout | Vertical card, fixed width for horizontal scroll |
| Avatar | Circle, icon or blurred image |
| Nickname | Bold, medium text |
| Tent Label | Gray tag, small |
| Status Badge | 🟢 Green dot + 'Open to Jam' |
| Intent Chip | Colored pill with emoji |
| Say Hi Button | Secondary style, full width at bottom |

#### 5.3.4 Intent Bottom Sheet
| Property | Value |
|----------|-------|
| Title | 'Today, you're open to…' |
| Options Layout | Vertical list, radio selection |
| Option 1 | ☕ Chill & chat |
| Option 2 | 🔥 Join activities (BBQ / Firecamp) |
| Option 3 | 🥾 Walk / explore |
| Option 4 | 🎸 Music / Jam |
| Option 5 | 👀 Just open to connect |
| CTA | 'Open for today' - Primary button |
| Note | 'Status turns off automatically at the end of the day' |

---

## 6. Empty & Edge States

### 6.1 Empty State A: No One Open
| Element | Content |
|---------|---------|
| Illustration | Calm camp / firepit icon |
| Title | No one is open to jam yet |
| Body | Be the first to open and start the camp vibe 🌿 |
| CTA | 🔥 Open to Jam? |

### 6.2 Empty State B: Only You Open
| Element | Content |
|---------|---------|
| Title | You're open to jam today 🙌 |
| Body | Waiting for other Campii to join |
| Note | Your status resets daily |

### 6.3 Edge State A: Quiet Hours
| Element | Content |
|---------|---------|
| State | Disable Open to Jam button, Disable Say Hi buttons |
| Message | Quiet hours are on 🌙 |
| Sub-message | Campii Connect will reopen at 7:00 AM |
| Footer | Thanks for keeping the camp peaceful |

### 6.4 Edge State B: Feature Disabled by Host
| Element | Content |
|---------|---------|
| Message | Campii Connect is unavailable at this camp |
| Sub-message | This helps maintain the camp atmosphere |

### 6.5 Edge State C: Below Privacy Threshold
| Element | Content |
|---------|---------|
| Condition | Tent has < 5 campers |
| Message | Not enough campers in this tent today |
| Sub-message | Some stats are hidden for privacy |

### 6.6 Edge State D: After Checkout
| Element | Content |
|---------|---------|
| Message | Your stay has ended |
| Sub-message | Campii Connect is only available during your stay |

---

## 7. Host Control Features

### 7.1 Host Control Requirements

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-HC-001 | Feature Toggle | Host เปิด/ปิด Campii Connect ทั้งแคมป์ได้ | High |
| FR-HC-002 | Quiet Hours | Host ตั้ง Quiet Hours (เช่น 22:00 - 07:00) ได้ | High |
| FR-HC-003 | Interaction Limit | Host จำกัด max interactions ต่อ user ต่อวันได้ | Medium |
| FR-HC-004 | Kill Switch | ปุ่ม Emergency disable ทันทีเมื่อมีปัญหา | High |
| FR-HC-005 | View Reports | Host เห็น reports จาก campers ได้ | Medium |
| FR-HC-006 | No Chat Access | Host ไม่เห็นเนื้อหา chat (privacy) | High |

### 7.2 Host Dashboard - Campii Connect Settings

| Setting | Type | Options |
|---------|------|---------|
| Campii Connect | Toggle | Enable / Disable |
| Quiet Hours Start | Time Picker | Default: 22:00 |
| Quiet Hours End | Time Picker | Default: 07:00 |
| Max Daily Interactions | Number Input | Default: 10, Range: 1-50 |
| Emergency Disable | Button | Red, requires confirmation |

---

## 8. Data Requirements

### 8.1 Campii Profile Data Model

| Field | Type | Description | Privacy |
|-------|------|-------------|---------|
| campiiId | string | UUID (internal only) | Never exposed |
| bookingId | string | Reference to active booking | Never exposed |
| nickname | string | Display name (not real name) | Public |
| avatarType | enum | icon / blurred_image | Public |
| tentId | string | Tent/Zone assignment | Public (label only) |
| ageRange | enum | 18-24, 25-29, 30-39, 40-49, 50+ | Aggregate only |
| tripType | enum | solo / friends / family / couple | Aggregate only |
| groupSize | number | Number in group | Aggregate only |
| gender | enum | male / female / other / prefer_not_to_say | Aggregate only (≥5) |
| checkInTime | datetime | Check-in timestamp | Never exposed |
| checkOutTime | datetime | Check-out timestamp | Never exposed |

### 8.2 Open to Jam Data Model

| Field | Type | Description | Retention |
|-------|------|-------------|-----------|
| sessionId | string | UUID for this open session | Daily reset |
| campiiId | string | Reference to Campii | Daily reset |
| intent | enum | chill / activities / walk / music / open | Daily reset |
| isOpen | boolean | Currently open status | Daily reset |
| openedAt | datetime | When opened | Daily reset |
| closedAt | datetime | When closed (manual or auto) | Daily reset |

### 8.3 Chat Data Model

| Field | Type | Description | Retention |
|-------|------|-------------|-----------|
| chatId | string | UUID for chat thread | Checkout + 24h |
| participantIds | string[] | Array of 2 campiiIds | Checkout + 24h |
| status | enum | pending / active / declined / closed | Checkout + 24h |
| messages | Message[] | Array of text messages | Checkout + 24h |
| createdAt | datetime | Chat initiated time | Checkout + 24h |
| expiresAt | datetime | Auto-close time | Checkout + 24h |

### 8.4 Host Settings Data Model

| Field | Type | Description |
|-------|------|-------------|
| campId | string | Reference to camp |
| campiiConnectEnabled | boolean | Feature toggle |
| quietHoursStart | time | Quiet hours start (e.g., 22:00) |
| quietHoursEnd | time | Quiet hours end (e.g., 07:00) |
| maxDailyInteractions | number | Max Say Hi per user per day |
| emergencyDisabled | boolean | Kill switch status |
| emergencyDisabledAt | datetime | When kill switch activated |

---

## 9. Privacy & Security Requirements

### 9.1 Privacy Requirements

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-PR-001 | Active Booking Only | ใช้ได้เฉพาะ Active Booking ที่ Check-in แล้ว | High |
| FR-PR-002 | No Personal Data | ไม่แสดงชื่อจริง, เบอร์โทร, email, หรือข้อมูลส่วนบุคคล | High |
| FR-PR-003 | Consent-Based Chat | ทุกการ chat ต้องผ่าน consent (Accept/Decline) | High |
| FR-PR-004 | Auto Data Expiry | ข้อมูลหมดอายุอัตโนมัติหลัง checkout + 24 ชม. | High |
| FR-PR-005 | Privacy Threshold | ไม่แสดงข้อมูล demographic ถ้ามีคนน้อยกว่า 5 | High |
| FR-PR-006 | Aggregate Only | ข้อมูล age, gender, trip type แสดงแบบ aggregate เท่านั้น | High |
| FR-PR-007 | No Relationship Status | ไม่แสดง relationship status | High |
| FR-PR-008 | Approximate Values | % ต้อง round to nearest 5%, prefix ด้วย ~ | Medium |

### 9.2 Security Requirements

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-SC-001 | Authentication | ต้อง Login และมี Active Booking | High |
| FR-SC-002 | Authorization | ตรวจสอบ booking status ทุก request | High |
| FR-SC-003 | Block Feature | ผู้ใช้ Block อีกฝ่ายได้ทันที | High |
| FR-SC-004 | Report Feature | ผู้ใช้ Report inappropriate behavior ได้ | High |
| FR-SC-005 | Rate Limiting | จำกัด Say Hi requests ตาม Host settings | Medium |
| FR-SC-006 | No Media Upload | ไม่อนุญาตให้ส่งรูป/ลิงก์ใน chat | High |
| FR-SC-007 | Encryption | Encrypt chat messages at rest | High |

### 9.3 PDPA Compliance
- **Data Minimization:** เก็บเฉพาะข้อมูลที่จำเป็น
- **Purpose Limitation:** ใช้เพื่อ social connection ระหว่างเข้าพักเท่านั้น
- **Storage Limitation:** ลบข้อมูลอัตโนมัติหลัง checkout + 24 ชม.
- **Consent:** ผู้ใช้ต้อง opt-in ด้วย Open to Jam
- **Re-identification Risk:** ต่ำมาก เนื่องจากใช้ aggregate data

---

## 10. Non-Functional Requirements

### 10.1 Performance

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-PERF-001 | Page Load Time | < 2 seconds |
| NFR-PERF-002 | Real-time Updates | < 3 seconds for new Campii |
| NFR-PERF-003 | Chat Message Delivery | < 1 second |
| NFR-PERF-004 | Daily Reset Processing | < 5 minutes at midnight |

### 10.2 Availability

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-AVL-001 | Uptime | 99.5% |
| NFR-AVL-002 | Offline Support | Show cached data when offline |

### 10.3 Success Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Feature Adoption | % ผู้ใช้ที่กด Open to Jam | ≥ 30% |
| Engagement Rate | % ที่มี Say Hi interactions | ≥ 20% |
| Chat Completion | % chat ที่มีการสนทนา | ≥ 50% |
| Host Opt-in | % แคมป์ที่เปิดใช้ฟีเจอร์ | ≥ 70% |
| Privacy Incidents | จำนวน privacy complaints | 0 |

---

## 11. Phase Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1 (Now)** | Camp Today, Open to Jam, 1:1 Social Chat (Text), Tent Vibe, Host Controls | 🟢 In Scope - This SRS |
| Phase 2 | Activity Board, Premium visibility, Host-led group activity | ⚪ Planned |
| Phase 3 | Sponsored activities, Community insights, Loyalty layer | ⚪ Future |

---

*End of Document*
