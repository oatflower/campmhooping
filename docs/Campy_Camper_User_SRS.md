# Software Requirements Specification (SRS)
# Campy - Camper User System

**ระบบสำหรับผู้ใช้งาน (Camper) - ค้นหา จอง และใช้งานแคมป์**

- **Version:** 1.0
- **Date:** 24 December 2568
- **Prepared by:** Campy Development Team

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [User Journey Overview](#2-user-journey-overview)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [UI Specifications](#5-ui-specifications)
6. [Empty & Edge States](#6-empty--edge-states)
7. [Data Requirements](#7-data-requirements)
8. [Privacy & Security](#8-privacy--security-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)

---

## 1. Introduction

### 1.1 Purpose
เอกสารนี้เป็น Software Requirements Specification (SRS) สำหรับระบบ Camper User ของแพลตฟอร์ม Campy ซึ่งเป็นระบบหลักสำหรับผู้ใช้งานทั่วไปที่ต้องการค้นหา เปรียบเทียบ และจองสถานที่แคมป์ปิ้ง พร้อมฟีเจอร์เสริมต่างๆ เพื่อเพิ่มประสบการณ์การใช้งาน

### 1.2 Key Principles

| Principle | Description |
|-----------|-------------|
| **Discovery-First** | เน้นการค้นพบแคมป์ใหม่ๆ ที่น่าสนใจ |
| **Visual-Driven** | ใช้รูปภาพและแผนที่เป็นหลัก |
| **Seamless Booking** | กระบวนการจองที่ราบรื่นและรวดเร็ว |
| **Mobile-First** | ออกแบบสำหรับมือถือเป็นหลัก |
| **Personalized** | แนะนำแคมป์ตามความชอบและประวัติ |
| **Community-Driven** | รีวิวและคอมมูนิตี้เป็นส่วนสำคัญ |

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **Camper** | ผู้ใช้งานที่ค้นหาและจองสถานที่แคมป์ปิ้ง |
| **Listing** | รายการสถานที่แคมป์ที่ Host ลงทะเบียน |
| **Instant Book** | การจองที่ไม่ต้องรอการอนุมัติจาก Host |
| **Check-in / Check-out** | วันที่เข้าพักและออก |
| **Guest** | จำนวนผู้เข้าพัก |
| **Favorites / Wishlist** | รายการแคมป์ที่บันทึกไว้ |
| **Trip Type** | ประเภทการเดินทาง (Solo, Friends, Family, Couple) |

---

## 2. User Journey Overview

### 2.1 Primary User Flow

1. **Discovery**
   - เปิดแอป → แสดงหน้าแรกพร้อม Featured camps
   - ค้นหาแคมป์ด้วย Search bar หรือ Category
   - ดูแผนที่แสดงตำแหน่งแคมป์

2. **Exploration**
   - เลือกดูรายละเอียดแคมป์
   - ดูรูปภาพ, สิ่งอำนวยความสะดวก, รีวิว
   - เช็คราคาและปฏิทินว่าง

3. **Booking**
   - เลือกวันที่และจำนวนผู้เข้าพัก
   - กรอกข้อมูลผู้จอง
   - เลือกวิธีชำระเงิน
   - ยืนยันการจอง

4. **Pre-Trip**
   - รับ Booking confirmation
   - ดูรายละเอียดการจองใน Profile
   - ติดต่อ Host ผ่าน Messages
   - เตรียมตัวด้วย Gear checklist

5. **During Trip**
   - Check-in ที่แคมป์
   - เข้าถึงฟีเจอร์ Camp Today (Campii Connect)
   - ใช้ Community features

6. **Post-Trip**
   - Check-out
   - เขียนรีวิว
   - แชร์ประสบการณ์

### 2.2 User Types

| User Type | Description | Characteristics |
|-----------|-------------|-----------------|
| First-time Camper | ผู้ใช้ใหม่ที่ไม่เคยแคมป์ | ต้องการคำแนะนำ, เลือก Glamping/พร้อมพัก |
| Experienced Camper | ผู้ใช้ที่มีประสบการณ์ | รู้ใจตัวเอง, ชอบธรรมชาติ, DIY |
| Weekend Warrior | ผู้ใช้ที่ไปแคมป์เป็นประจำ | จองบ่อย, มี Gear ครบ |
| Family Camper | ครอบครัว | ต้องการความปลอดภัย, สิ่งอำนวยความสะดวก |
| Solo Adventurer | ผู้ใช้คนเดียว | มองหา Social features, ความปลอดภัย |

---

## 3. User Stories

### 3.1 Discovery & Search

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-001 | As a camper, I want to see featured camps on the homepage | แสดง Featured camps พร้อมรูป, ราคา, rating |
| US-002 | As a camper, I want to search camps by location | ค้นหาด้วยชื่อสถานที่, จังหวัด, แสดงผลลัพธ์ |
| US-003 | As a camper, I want to filter camps by price range | เลื่อน Slider เลือกช่วงราคา, อัปเดตผลทันที |
| US-004 | As a camper, I want to filter camps by facilities | Checkbox สิ่งอำนวยความสะดวก, แสดงเฉพาะที่ตรง |
| US-005 | As a camper, I want to view camps on a map | แสดงแผนที่พร้อม Pins, คลิกเพื่อดูรายละเอียด |
| US-006 | As a camper, I want to browse camps by category | Category cards: ภูเขา, ทะเล, ป่า, ใกล้กรุงเทพ |
| US-007 | As a camper, I want to save camps to favorites | ปุ่ม Heart เพื่อบันทึก, เข้าถึงใน Profile |

### 3.2 Camp Details

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-101 | As a camper, I want to see camp photos clearly | Image gallery พร้อม Fullscreen view |
| US-102 | As a camper, I want to know all facilities available | แสดง Icons พร้อมชื่อสิ่งอำนวยความสะดวก |
| US-103 | As a camper, I want to read reviews from other campers | แสดงรีวิวพร้อม Rating, Photo, Date |
| US-104 | As a camper, I want to see camp location on map | แสดงแผนที่ตำแหน่งแคมป์ |
| US-105 | As a camper, I want to check availability calendar | Calendar แสดงวันที่ว่าง/ไม่ว่าง พร้อมราคา |
| US-106 | As a camper, I want to see camp rules clearly | แสดงกฎของแคมป์ (สูบบุหรี่, สัตว์เลี้ยง, ฯลฯ) |
| US-107 | As a camper, I want to contact the host | ปุ่ม Message host |

### 3.3 Booking & Payment

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-201 | As a camper, I want to select check-in/out dates | Date picker, แสดงราคารวม |
| US-202 | As a camper, I want to specify number of guests | Number input สำหรับจำนวนผู้เข้าพัก |
| US-203 | As a camper, I want to see price breakdown | แสดง Base price, Fees, Discounts, Total |
| US-204 | As a camper, I want to fill booking details quickly | Form: ชื่อ, เบอร์, Email, Trip type |
| US-205 | As a camper, I want multiple payment options | Prompt Pay, Credit Card, Mobile Banking |
| US-206 | As a camper, I want booking confirmation immediately | หน้า Confirmation + Email + SMS |
| US-207 | As a camper, I want to apply discount codes | Input field สำหรับ Promo code |

### 3.4 Profile & Account

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-301 | As a camper, I want to view my upcoming trips | List การจองที่จะมาถึง |
| US-302 | As a camper, I want to view my past trips | History การจองที่ผ่านมา |
| US-303 | As a camper, I want to manage my profile | แก้ไขชื่อ, รูป, Bio, Preferences |
| US-304 | As a camper, I want to see my favorite camps | List แคมป์ที่บันทึกไว้ |
| US-305 | As a camper, I want to write reviews | Form รีวิว: Rating, Text, Photos |
| US-306 | As a camper, I want to view messages with hosts | Message threads |

### 3.5 Community & Social

| ID | User Story | Acceptance Criteria |
|----|------------|---------------------|
| US-401 | As a camper, I want to see what's happening at camp today | Camp Today page (เฉพาะ checked-in users) |
| US-402 | As a camper, I want to connect with other campers | Campii Connect feature (ตาม SRS แยก) |
| US-403 | As a camper, I want to browse camping gear | Gear marketplace/guide |
| US-404 | As a camper, I want to read camping tips | Community content, Articles |

---

## 4. Functional Requirements

### 4.1 Homepage Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-HOME-001 | Hero Section | แสดง Hero image พร้อม Search bar | High |
| FR-HOME-002 | Search Bar | ค้นหาด้วย Location, Check-in, Guests | High |
| FR-HOME-003 | Category Tabs | แสดง Category: ภูเขา, ทะเล, ป่า, ใกล้กรุงเทพ, Glamping | High |
| FR-HOME-004 | Featured Camps | แสดง Featured camps แนะนำ (6-12 อัน) | High |
| FR-HOME-005 | Personalized Recommendations | แสดงแคมป์แนะนำตาม User preferences | Medium |
| FR-HOME-006 | Trending Now | แสดงแคมป์ที่ Trending | Low |

### 4.2 Search & Filter Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-SRC-001 | Location Search | Autocomplete สำหรับชื่อสถานที่, จังหวัด | High |
| FR-SRC-002 | Date Range Picker | เลือกวันที่ Check-in และ Check-out | High |
| FR-SRC-003 | Guest Counter | Stepper สำหรับจำนวนผู้เข้าพัก | High |
| FR-SRC-004 | Price Range Filter | Slider เลือกช่วงราคา (฿/คืน) | High |
| FR-SRC-005 | Camp Type Filter | Checkbox: ลานกาง, เต็นท์พร้อมพัก, Glamping, ฯลฯ | High |
| FR-SRC-006 | Facilities Filter | Multi-select: ห้องน้ำ, Wi-Fi, ปลั๊กไฟ, ฯลฯ | High |
| FR-SRC-007 | Environment Filter | Multi-select: ภูเขา, ทะเล, ป่า, ทุ่งนา, ฯลฯ | Medium |
| FR-SRC-008 | Instant Book Filter | Toggle: แสดงเฉพาะ Instant Book | Medium |
| FR-SRC-009 | Sort Options | เรียงตาม: ราคา, Rating, Distance, Trending | High |
| FR-SRC-010 | Clear Filters | ปุ่มล้าง Filters ทั้งหมด | Medium |

### 4.3 Map View Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-MAP-001 | Map Display | แสดงแผนที่ Mapbox พร้อม Camp pins | High |
| FR-MAP-002 | Camp Markers | Markers แสดงราคาบนแผนที่ | High |
| FR-MAP-003 | Marker Clustering | รวม Markers เมื่อ Zoom out | Medium |
| FR-MAP-004 | Map Popup | คลิก Marker → แสดง Camp card popup | High |
| FR-MAP-005 | Map Sync | Drag แผนที่ → อัปเดต List view | High |
| FR-MAP-006 | Current Location | ปุ่มกลับไปตำแหน่งปัจจุบัน | Medium |
| FR-MAP-007 | Map/List Toggle | สลับระหว่าง Map view และ List view | High |

### 4.4 Camp List Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-LST-001 | Camp Card | แสดง Card: รูป, ชื่อ, ราคา, Rating, Location | High |
| FR-LST-002 | Favorite Button | Heart icon เพื่อบันทึก Favorite | High |
| FR-LST-003 | Instant Book Badge | แสดง Badge ถ้าเป็น Instant Book | Medium |
| FR-LST-004 | Pagination | Load more เมื่อ Scroll ลง (Infinite scroll) | High |
| FR-LST-005 | Results Count | แสดงจำนวนผลลัพธ์ | Medium |
| FR-LST-006 | No Results State | แสดง Empty state เมื่อไม่มีผลลัพธ์ | High |

### 4.5 Camp Detail Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-DTL-001 | Image Gallery | Gallery รูปแคมป์ พร้อม Fullscreen view | High |
| FR-DTL-002 | Camp Title | แสดงชื่อแคมป์ + Rating + Location | High |
| FR-DTL-003 | Host Info | แสดงชื่อ Host + รูป + Join date | Medium |
| FR-DTL-004 | Camp Description | แสดงคำอธิบายแคมป์ | High |
| FR-DTL-005 | Facilities Section | แสดง Icons สิ่งอำนวยความสะดวก | High |
| FR-DTL-006 | Capacity Info | แสดงจำนวน Campers, Tents, Bathrooms | High |
| FR-DTL-007 | Rules Section | แสดงกฎของแคมป์ (สูบบุหรี่, สัตว์เลี้ยง, ฯลฯ) | High |
| FR-DTL-008 | Location Map | แสดงแผนที่ตำแหน่งแคมป์ | High |
| FR-DTL-009 | Reviews Section | แสดงรีวิวจากผู้เข้าพัก | High |
| FR-DTL-010 | Availability Calendar | แสดง Calendar พร้อมราคา | High |
| FR-DTL-011 | Booking Widget | Sticky booking widget ด้านขวา/ล่าง | High |
| FR-DTL-012 | Share Button | แชร์ Listing | Low |
| FR-DTL-013 | Report Button | Report Listing | Low |

### 4.6 Booking Flow Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-BKG-001 | Date Selection | Date picker สำหรับ Check-in/Check-out | High |
| FR-BKG-002 | Guest Input | Number input สำหรับจำนวนผู้เข้าพัก | High |
| FR-BKG-003 | Price Calculation | คำนวณราคาแบบ Real-time | High |
| FR-BKG-004 | Price Breakdown | แสดง: Base price × nights, Service fee, Discounts, Total | High |
| FR-BKG-005 | Guest Details Form | Form: ชื่อ-นามสกุล, เบอร์, Email | High |
| FR-BKG-006 | Trip Type Selection | Radio: Solo, Friends, Family, Couple | Medium |
| FR-BKG-007 | Special Requests | Textarea สำหรับคำขอพิเศษ | Low |
| FR-BKG-008 | Terms Agreement | Checkbox ยอมรับเงื่อนไข | High |
| FR-BKG-009 | Promo Code | Input field + Apply button | Medium |
| FR-BKG-010 | Booking Summary | Review ข้อมูลก่อนจ่าย | High |

### 4.7 Payment Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-PAY-001 | Payment Methods | แสดงตัวเลือก: Prompt Pay, Credit/Debit Card, Mobile Banking | High |
| FR-PAY-002 | Prompt Pay QR | Generate QR Code สำหรับ Prompt Pay | High |
| FR-PAY-003 | Credit Card Form | Form: Card number, Expiry, CVV | High |
| FR-PAY-004 | Secure Payment | Encrypt payment data | High |
| FR-PAY-005 | Payment Status | Real-time แสดงสถานะการชำระเงิน | High |
| FR-PAY-006 | Payment Timeout | แสดง Countdown timer (15 นาที) | Medium |
| FR-PAY-007 | Confirmation Page | หน้ายืนยันการจองสำเร็จ | High |
| FR-PAY-008 | Email Confirmation | ส่ง Email ยืนยันการจอง | High |
| FR-PAY-009 | SMS Confirmation | ส่ง SMS ยืนยันการจอง | Medium |

### 4.8 Profile Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-PRF-001 | Profile Picture | อัปโหลด/แก้ไขรูปโปรไฟล์ | Medium |
| FR-PRF-002 | Personal Info | แก้ไข: ชื่อ, เบอร์, Email, Bio | High |
| FR-PRF-003 | Preferences | ตั้งค่า: ภาษา, สกุลเงิน | Medium |
| FR-PRF-004 | Upcoming Trips Tab | แสดงการจองที่จะมาถึง | High |
| FR-PRF-005 | Past Trips Tab | แสดงประวัติการจองที่ผ่านมา | High |
| FR-PRF-006 | Trip Details | คลิกเพื่อดูรายละเอียดการจอง | High |
| FR-PRF-007 | Cancel Booking | ยกเลิกการจอง (ตาม Policy) | High |
| FR-PRF-008 | Download Receipt | ดาวน์โหลดใบเสร็จ | Medium |

### 4.9 Favorites Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-FAV-001 | Add to Favorites | ปุ่ม Heart เพื่อบันทึก | High |
| FR-FAV-002 | Remove from Favorites | คลิก Heart อีกครั้งเพื่อลบ | High |
| FR-FAV-003 | Favorites List | แสดงรายการแคมป์ที่บันทึกไว้ | High |
| FR-FAV-004 | Empty State | แสดง Empty state เมื่อไม่มี Favorites | High |
| FR-FAV-005 | Quick Book | Book จาก Favorites ได้โดยตรง | Medium |

### 4.10 Messages Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-MSG-001 | Message List | แสดงรายการ Conversations | High |
| FR-MSG-002 | Unread Badge | แสดงจำนวนข้อความที่ยังไม่ได้อ่าน | High |
| FR-MSG-003 | Message Thread | แสดงประวัติสนทนากับ Host | High |
| FR-MSG-004 | Send Message | ส่งข้อความถึง Host | High |
| FR-MSG-005 | Text Only | Support ข้อความ Text เท่านั้น | High |
| FR-MSG-006 | Message Timestamp | แสดงเวลาส่งข้อความ | Medium |
| FR-MSG-007 | Booking Context | แสดงข้อมูลการจองที่เกี่ยวข้อง | Medium |

### 4.11 Reviews Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-REV-001 | Write Review | Form สำหรับเขียนรีวิวหลัง Check-out | High |
| FR-REV-002 | Star Rating | เลือก Rating 1-5 ดาว | High |
| FR-REV-003 | Review Text | Textarea สำหรับความคิดเห็น (max 500 chars) | High |
| FR-REV-004 | Upload Photos | อัปโหลดรูปภาพประกอบรีวิว (optional) | Medium |
| FR-REV-005 | Category Ratings | Rating แยกหมวด: Cleanliness, Location, Value, Host | Medium |
| FR-REV-006 | Display Reviews | แสดงรีวิวใน Camp detail | High |
| FR-REV-007 | Sort Reviews | เรียงตาม: ล่าสุด, Rating สูง/ต่ำ | Medium |
| FR-REV-008 | Helpful Vote | ปุ่ม 'Helpful' สำหรับรีวิว | Low |

### 4.12 Camp Today Module (Checked-in Users)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-CTP-001 | Access Control | เข้าได้เฉพาะผู้ที่ Check-in แล้ว | High |
| FR-CTP-002 | Camp Overview | แสดงข้อมูล Aggregate ของแคมป์วันนี้ | High |
| FR-CTP-003 | Open to Jam | ปุ่มประกาศสถานะพร้อมเชื่อมต่อ | High |
| FR-CTP-004 | Campii Connect | แสดง Campers ที่ Open to Jam (ดูรายละเอียดใน Campii Connect SRS) | High |
| FR-CTP-005 | Tent Vibe | แสดงข้อมูล Tent/Zone แบบ Anonymous | Medium |

### 4.13 Authentication Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-AUTH-001 | Email/Password Login | Login ด้วย Email + Password | High |
| FR-AUTH-002 | Social Login | Login ด้วย Google, Facebook, Apple | High |
| FR-AUTH-003 | Phone Login | Login ด้วยเบอร์โทร + OTP | High |
| FR-AUTH-004 | Sign Up | สมัครสมาชิกใหม่ | High |
| FR-AUTH-005 | Forgot Password | รีเซ็ตรหัสผ่าน | High |
| FR-AUTH-006 | Guest Checkout | จองโดยไม่ต้องสมัครสมาชิก (Email only) | Low |

---

## 5. UI Specifications

### 5.1 Design System

- **Primary Color:** Green (#2E7D32) สื่อถึงธรรมชาติ
- **Secondary Color:** Neutral tones (Gray, White)
- **Accent Color:** Orange สำหรับ CTA หลัก
- **Font:** DM Sans (Primary), Noto Sans Thai (Thai)
- **Icons:** Lucide React + Custom Camp Icons
- **Components:** Shadcn-UI (Radix)
- **Grid:** 12-column responsive grid

### 5.2 Mobile-First Layout

#### 5.2.1 Header
- **Mobile:** Hamburger menu + Logo + Profile icon
- **Desktop:** Logo + Navigation tabs + Search bar + Profile dropdown

#### 5.2.2 Bottom Navigation (Mobile Only)
- 5 tabs: Home, Search, Favorites, Messages, Profile
- Active state: Colored icon + text

#### 5.2.3 Search Bar
- **Compact:** Location | Dates | Guests | Search button
- **Expanded:** Separate rows สำหรับแต่ละ input

### 5.3 Component Specifications

#### 5.3.1 Camp Card
| Property | Value |
|----------|-------|
| Layout | Image top + Content bottom |
| Image | 16:9 aspect ratio, Lazy load |
| Favorite Button | Heart icon, top-right corner |
| Instant Book Badge | Green badge ถ้ามี |
| Title | Max 2 lines, ellipsis |
| Location | Gray text พร้อม 📍 icon |
| Rating | ⭐ icon + score + (reviews count) |
| Price | Bold, ฿/night |

#### 5.3.2 Image Gallery
| Property | Value |
|----------|-------|
| Layout | Grid 2x3 บนมือถือ, 3x4 บน Desktop |
| Interaction | Tap → Fullscreen carousel |
| Navigation | Swipe หรือ Arrow buttons |
| Thumbnails | Show ในโหมด Fullscreen |

#### 5.3.3 Booking Widget
| Property | Value |
|----------|-------|
| Position | Sticky ด้านขวา (Desktop), ด้านล่าง (Mobile) |
| Content | Date picker + Guests + Price breakdown + Reserve button |
| Style | White card with shadow, rounded corners |

#### 5.3.4 Date Picker
| Property | Value |
|----------|-------|
| Type | Calendar view |
| Selection | Check-in → Check-out (range) |
| Min Stay | ตาม Camp policy (default 1 night) |
| Unavailable Dates | Gray out, ไม่สามารถเลือกได้ |
| Price Display | แสดงราคาในแต่ละวัน (optional) |

### 5.4 Key Screens Layout

#### 5.4.1 Homepage
```
┌─────────────────────────────────┐
│ Header                          │
├─────────────────────────────────┤
│ Hero + Search Bar               │
├─────────────────────────────────┤
│ Category Tabs                   │
├─────────────────────────────────┤
│ Featured Camps Grid             │
├─────────────────────────────────┤
│ Trending Section                │
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

#### 5.4.2 Search Results
```
┌─────────────────────────────────┐
│ Header + Search Bar             │
├─────────────────────────────────┤
│ Filters Bar + Map/List Toggle   │
├─────────────────────────────────┤
│ Results Count                   │
├─────────────────────────────────┤
│ Camp Cards List / Map View      │
└─────────────────────────────────┘
```

#### 5.4.3 Camp Detail
```
┌─────────────────────────────────┐
│ Image Gallery                   │
├─────────────────────────────────┤
│ Title + Rating + Share          │
├─────────────────────────────────┤
│ Host Info                       │
├─────────────────────────────────┤
│ Description                     │
├─────────────────────────────────┤
│ Facilities Icons                │
├─────────────────────────────────┤
│ Capacity Info                   │
├─────────────────────────────────┤
│ Rules                           │
├─────────────────────────────────┤
│ Location Map                    │
├─────────────────────────────────┤
│ Reviews                         │
├─────────────────────────────────┤
│ Booking Widget (Sticky)         │
└─────────────────────────────────┘
```

---

## 6. Empty & Edge States

### 6.1 Empty State A: No Search Results

| Element | Content |
|---------|---------|
| Illustration | 🏕️ Tent icon with sad face |
| Title | ไม่พบแคมป์ที่ตรงกับเงื่อนไข |
| Body | ลองปรับ Filters หรือค้นหาสถานที่อื่น |
| CTA | ล้างฟิลเตอร์ทั้งหมด |

### 6.2 Empty State B: No Favorites

| Element | Content |
|---------|---------|
| Illustration | ❤️ Empty heart icon |
| Title | คุณยังไม่มีแคมป์ที่ชื่นชอบ |
| Body | กด Heart บนแคมป์ที่คุณสนใจเพื่อบันทึกไว้ |
| CTA | เริ่มค้นหาแคมป์ |

### 6.3 Empty State C: No Messages

| Element | Content |
|---------|---------|
| Illustration | 💬 Message icon |
| Title | คุณยังไม่มีข้อความ |
| Body | เมื่อคุณจองแคมป์ คุณสามารถติดต่อ Host ได้ที่นี่ |

### 6.4 Empty State D: No Upcoming Trips

| Element | Content |
|---------|---------|
| Illustration | 🏕️ Camp tent |
| Title | คุณยังไม่มีทริปที่จะมาถึง |
| Body | เริ่มวางแผนทริปถัดไปของคุณ |
| CTA | ค้นหาแคมป์ |

### 6.5 Edge State A: Booking Unavailable

| Element | Content |
|---------|---------|
| State | Disable Reserve button |
| Message | ขออภัย วันที่นี้ไม่ว่าง |
| Sub-message | กรุณาเลือกวันอื่น |

### 6.6 Edge State B: Payment Timeout

| Element | Content |
|---------|---------|
| Title | หมดเวลาชำระเงิน |
| Body | การจองของคุณถูกยกเลิกแล้ว กรุณาลองใหม่อีกครั้ง |
| CTA | กลับไปหน้าแคมป์ |

### 6.7 Edge State C: Sold Out

| Element | Content |
|---------|---------|
| Badge | 🔴 Sold out |
| Message | แคมป์เต็มสำหรับช่วงวันที่นี้ |
| CTA | ดูวันอื่น |

### 6.8 Edge State D: Booking Pending Approval

| Element | Content |
|---------|---------|
| Status | ⏳ Pending approval |
| Message | รอ Host ยืนยันการจอง |
| Sub-message | คุณจะได้รับการแจ้งเตือนภายใน 24 ชม. |

---

## 7. Data Requirements

### 7.1 User Profile Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| userId | string | UUID รหัสผู้ใช้ | Auto |
| email | string | Email | Yes |
| phone | string | เบอร์โทร | Yes |
| firstName | string | ชื่อ | Yes |
| lastName | string | นามสกุล | Yes |
| profilePicture | string | URL รูปโปรไฟล์ | No |
| bio | string | คำอธิบายตัวเอง (max 200) | No |
| dateOfBirth | date | วันเกิด | No |
| preferredLanguage | enum | th / en | Yes |
| preferredCurrency | enum | THB / USD | Yes |
| tripPreferences | object | ความชอบในการเดินทาง | No |
| createdAt | datetime | วันที่สมัคร | Auto |

### 7.2 Booking Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| bookingId | string | UUID รหัสการจอง | Auto |
| userId | string | รหัสผู้จอง | Yes |
| listingId | string | รหัสแคมป์ | Yes |
| checkIn | date | วันที่เข้าพัก | Yes |
| checkOut | date | วันที่ออก | Yes |
| guests | number | จำนวนผู้เข้าพัก | Yes |
| tripType | enum | solo / friends / family / couple | Yes |
| status | enum | pending / confirmed / checked_in / checked_out / cancelled | Yes |
| basePrice | number | ราคาพื้นฐาน | Yes |
| serviceFee | number | ค่าบริการ | Yes |
| discount | number | ส่วนลด | No |
| totalPrice | number | ราคารวม | Yes |
| promoCode | string | รหัสโปรโมชั่น | No |
| specialRequests | string | คำขอพิเศษ | No |
| paymentMethod | enum | promptpay / credit_card / mobile_banking | Yes |
| paymentStatus | enum | pending / paid / failed / refunded | Yes |
| createdAt | datetime | วันที่จอง | Auto |

### 7.3 Favorite Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| favoriteId | string | UUID | Auto |
| userId | string | รหัสผู้ใช้ | Yes |
| listingId | string | รหัสแคมป์ | Yes |
| createdAt | datetime | วันที่บันทึก | Auto |

### 7.4 Review Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| reviewId | string | UUID | Auto |
| bookingId | string | รหัสการจอง | Yes |
| userId | string | ผู้เขียนรีวิว | Yes |
| listingId | string | แคมป์ที่รีวิว | Yes |
| rating | number | คะแนน 1-5 | Yes |
| cleanliness | number | ความสะอาด 1-5 | No |
| location | number | ทำเลที่ตั้ง 1-5 | No |
| value | number | คุ้มค่า 1-5 | No |
| hostRating | number | Host 1-5 | No |
| comment | string | ความคิดเห็น (max 500) | Yes |
| photos | string[] | URLs รูปภาพ | No |
| helpfulCount | number | จำนวนคนกด Helpful | Auto |
| createdAt | datetime | วันที่เขียน | Auto |

### 7.5 Message Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| messageId | string | UUID | Auto |
| threadId | string | UUID ของ Conversation | Yes |
| senderId | string | ผู้ส่ง (userId or hostId) | Yes |
| recipientId | string | ผู้รับ | Yes |
| bookingId | string | การจองที่เกี่ยวข้อง | Yes |
| content | string | ข้อความ (text only) | Yes |
| isRead | boolean | อ่านแล้ว | Auto |
| createdAt | datetime | เวลาส่ง | Auto |

---

## 8. Privacy & Security Requirements

### 8.1 Privacy Requirements

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| PR-001 | Data Minimization | เก็บเฉพาะข้อมูลที่จำเป็น | High |
| PR-002 | User Consent | ขออนุญาตก่อนเก็บข้อมูล | High |
| PR-003 | Data Access | ผู้ใช้เข้าถึงและแก้ไขข้อมูลได้ | High |
| PR-004 | Data Deletion | ผู้ใช้ลบข้อมูลได้ | High |
| PR-005 | Location Privacy | ไม่แชร์ตำแหน่งแน่นอกโดยไม่ได้รับอนุญาต | High |
| PR-006 | Payment Security | ไม่เก็บข้อมูลบัตรเครดิต (ใช้ Payment gateway) | High |

### 8.2 Security Requirements

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| SEC-001 | Authentication | ต้อง Login ก่อนจอง | High |
| SEC-002 | Password Encryption | เข้ารหัสรหัสผ่าน (bcrypt/argon2) | High |
| SEC-003 | HTTPS Only | ใช้ HTTPS สำหรับทุก Request | High |
| SEC-004 | XSS Protection | ป้องกัน Cross-site scripting | High |
| SEC-005 | CSRF Protection | ป้องกัน Cross-site request forgery | High |
| SEC-006 | Rate Limiting | จำกัดจำนวน Request เพื่อป้องกัน Abuse | Medium |
| SEC-007 | Payment Tokenization | ใช้ Token แทนข้อมูลการชำระเงินจริง | High |

### 8.3 PDPA Compliance

- **การขออนุญาต:** แสดง Consent form ก่อนเก็บข้อมูล
- **การเข้าถึงข้อมูล:** ผู้ใช้ดาวน์โหลดข้อมูลของตัวเองได้
- **การลบข้อมูล:** ผู้ใช้ร้องขอลบข้อมูลได้
- **การแจ้งเตือน:** แจ้งการเปลี่ยนแปลง Privacy Policy
- **การเก็บข้อมูล:** เก็บไม่เกิน 7 ปี หลังการใช้งานครั้งสุดท้าย

---

## 9. Non-Functional Requirements

### 9.1 Performance

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-PERF-001 | Page Load Time | < 2 seconds |
| NFR-PERF-002 | Image Load Time | < 1 second (with lazy loading) |
| NFR-PERF-003 | Search Response Time | < 1 second |
| NFR-PERF-004 | Map Render Time | < 1.5 seconds |
| NFR-PERF-005 | API Response Time | < 500ms (p95) |
| NFR-PERF-006 | Real-time Updates | < 3 seconds (messages) |

### 9.2 Availability

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-AVL-001 | Uptime | 99.9% |
| NFR-AVL-002 | Offline Support | Show cached data |
| NFR-AVL-003 | Error Recovery | Graceful degradation |
| NFR-AVL-004 | Maintenance Window | < 4 hours/month |

### 9.3 Scalability

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-SCL-001 | Concurrent Users | Support 10,000+ users |
| NFR-SCL-002 | Database Scaling | Horizontal scaling ready |
| NFR-SCL-003 | CDN Integration | Images served via CDN |
| NFR-SCL-004 | Caching Strategy | Redis for frequent queries |

### 9.4 Usability

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-USA-001 | Mobile Responsive | 100% functional on mobile |
| NFR-USA-002 | Accessibility | WCAG 2.1 Level AA |
| NFR-USA-003 | Multi-language | Thai + English |
| NFR-USA-004 | Browser Support | Chrome, Safari, Firefox, Edge (latest 2 versions) |
| NFR-USA-005 | Touch Optimization | Native gestures support |

### 9.5 Success Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Conversion Rate | % ผู้เข้าชมที่จอง | ≥ 5% |
| Search Success Rate | % การค้นหาที่มีผลลัพธ์ | ≥ 95% |
| Booking Completion Rate | % ที่ชำระเงินสำเร็จ | ≥ 80% |
| Average Session Duration | เวลาเฉลี่ยที่ใช้ในแอป | ≥ 5 minutes |
| User Retention (30-day) | % ผู้ใช้ที่กลับมา | ≥ 40% |
| Net Promoter Score (NPS) | ความพึงพอใจผู้ใช้ | ≥ 50 |

---

## 10. Integration Requirements

### 10.1 Third-Party Services

| Service | Purpose | Priority |
|---------|---------|----------|
| Supabase | Database + Auth | High |
| Mapbox | Maps + Geocoding | High |
| Payment Gateway | Omise / GB Prime Pay | High |
| Email Service | SendGrid / AWS SES | High |
| SMS Service | Twilio / Thai SMS provider | Medium |
| Analytics | Google Analytics / Mixpanel | High |
| Crash Reporting | Sentry | High |
| CDN | Cloudflare / AWS CloudFront | High |

### 10.2 API Requirements

| API | Description | Priority |
|-----|-------------|----------|
| REST API | Primary API for CRUD operations | High |
| WebSocket | Real-time messaging | Medium |
| GraphQL | (Optional) สำหรับ Complex queries | Low |

---

*End of Document*
