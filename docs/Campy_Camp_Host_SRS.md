# Software Requirements Specification (SRS)
# Campy - Camp Host Merchant System

**ระบบจัดการสำหรับเจ้าของแคมป์**

- **Version:** 2.0
- **Date:** 20 December 2568
- **Prepared by:** Campy Development Team

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Onboarding Flow (24 Pages)](#3-onboarding-flow-24-pages)
4. [Functional Requirements](#4-functional-requirements)
5. [Host Dashboard Requirements](#5-host-dashboard-requirements)
6. [Data Requirements](#6-data-requirements)
7. [User Interface Requirements](#7-user-interface-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)

---

## 1. Introduction

### 1.1 Purpose
เอกสารนี้เป็น Software Requirements Specification (SRS) สำหรับระบบ Camp Host Merchant ของ Campy ซึ่งเป็นระบบจัดการสำหรับเจ้าของแคมป์ที่ต้องการลงทะเบียนและบริหารจัดการสถานที่แคมป์ปิ้งบนแพลตฟอร์ม โดยออกแบบ Onboarding flow แบบ 1 หน้า = 1 คำถาม เพื่อความง่ายและรวดเร็ว

### 1.2 Key Design Principles
- **1 Page = 1 Question:** ทุกหน้ามีเพียงคำถามเดียวเพื่อลด cognitive load
- **Progressive Disclosure:** แสดงข้อมูลทีละส่วนตามลำดับที่เหมาะสม
- **Icon-First Design:** ใช้ไอคอนช่วยให้เข้าใจเร็ว
- **Save & Continue:** บันทึกความคืบหน้าและกลับมาทำต่อได้
- **Mode Switching:** สลับระหว่าง Camper ↔ Camp Host ได้ง่าย

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **Camp Host** | เจ้าของสถานที่แคมป์ปิ้งที่ลงทะเบียนบนแพลตฟอร์ม |
| **Camper** | ผู้ใช้ที่ค้นหาและจองสถานที่แคมป์ปิ้ง |
| **Listing** | รายการสถานที่แคมป์ที่ Camp Host สร้างขึ้น |
| **Zone/Unit** | พื้นที่ย่อยภายในแคมป์ที่มีราคาและความจุแยกกัน |
| **Instant Book** | การจองที่ไม่ต้องรอการอนุมัติจาก Host |
| **Onboarding** | กระบวนการลงทะเบียน Camp Host ใหม่ (24 หน้า) |

---

## 2. System Overview

### 2.1 System Description
Camp Host Merchant System เป็นส่วนขยายของแพลตฟอร์ม Campy ที่ให้เจ้าของสถานที่แคมป์ปิ้งสามารถลงทะเบียน จัดการ และรับการจองจาก Camper ได้ ระบบออกแบบให้มี Onboarding flow ที่ง่ายเพียง 24 หน้า โดยแต่ละหน้ามีเพียง 1 คำถาม

### 2.2 User Types

| User Type | Description | Primary Activities |
|-----------|-------------|-------------------|
| New Camp Host | เจ้าของแคมป์ที่ต้องการลงทะเบียนใหม่ | Onboarding 24 หน้า, สร้าง Listing แรก |
| Active Camp Host | เจ้าของแคมป์ที่มี Listing แล้ว | จัดการ Listing, ราคา, ปฏิทิน, การจอง |
| Dual User | ผู้ใช้ที่เป็นทั้ง Camper และ Camp Host | สลับโหมด Camper ↔ Camp Host |

### 2.3 Tech Stack
- **Frontend:** React 18.3.1 + TypeScript 5.8.3
- **Build Tool:** Vite 5.4.19
- **Styling:** Tailwind CSS 3.4.17 + Shadcn-UI
- **State Management:** TanStack React Query 5.83.0
- **Maps:** Mapbox GL 3.17.0
- **Form Handling:** React Hook Form 7.61.1 + Zod

---

## 3. Onboarding Flow (24 Pages)

Onboarding แบ่งเป็น 3 Steps หลัก รวม 24 หน้า โดยแต่ละหน้ามีเพียง 1 คำถามหลัก

### 3.1 Step 1: บอกเราเกี่ยวกับแคมป์ของคุณ (Page 0-7)

| Page | หัวข้อ | Input Type | ตัวเลือก / Details |
|------|--------|------------|-------------------|
| 0 | Get Started | Info + CTA | 'เริ่มต้นบน Campy ง่ายมาก' → ปุ่ม Get Started |
| 1 | Step 1 Intro | Info + CTA | 'บอกเราเกี่ยวกับแคมป์ของคุณ' → ปุ่ม Next |
| 2 | ประเภทแคมป์ | Single Select Card | ⛺ ลานกางเต็นท์ / 🏕️ เต็นท์พร้อมพัก / 🛖 Glamping / 🏡 บ้านพักธรรมชาติ / 🚐 Campervan / 🌿 ที่พักรูปแบบพิเศษ |
| 3 | ที่ตั้งแคมป์ | Map + Address | กรอกที่อยู่ → แสดงบน Mapbox |
| 4 | ยืนยันตำแหน่ง | Map Drag Pin | ลาก Pin ปรับตำแหน่ง + Toggle แสดงตำแหน่งแน่นอน |
| 5 | บรรยากาศแคมป์ | Multi Select Pill | 🌲 ใกล้กรุงเทพ / ⛰️ วิวภูเขา / ☁️ ทะเลหมอก / 🌊 ริมแม่น้ำ / 🏖️ ริมทะเล / 🌳 ป่าเขา / 🌾 ทุ่งนา / 🌌 ดูดาว |
| 6 | ความจุ | Number Steppers | จำนวน Camper สูงสุด / จำนวนจุดกาง/ยูนิต / จำนวนห้องน้ำ |
| 7 | โซน/ยูนิต | Dynamic List + Add | สร้างโซน: ชื่อโซน + ความจุ + ราคา (เพิ่มได้หลายโซน) |

### 3.2 Step 2: ทำให้แคมป์โดดเด่น (Page 8-17)

| Page | หัวข้อ | Input Type | ตัวเลือก / Details |
|------|--------|------------|-------------------|
| 8 | Step 2 Intro | Info + CTA | 'ทำให้แคมป์โดดเด่น' → ปุ่ม Next |
| 9 | ห้องน้ำ | Checkbox | 🚿 มีห้องน้ำ / 🚿🚽 ห้องน้ำส่วนตัว / 🔥 น้ำอุ่น |
| 10 | ความสะดวก | Checkbox | 🔌 ปลั๊กไฟ / 📶 สัญญาณมือถือ / 📡 Wi-Fi |
| 11 | อุปกรณ์ให้เช่า | Checkbox | ⛺ เต็นท์ / 🪵 ทาร์ป / 🔌 ปลั๊กพกพา |
| 12 | อาหาร & สิ่งอำนวยความสะดวก | Radio + Checkbox | Radio: 🍳 ทำได้ / 🚫 ห้าม / Checkbox: 🔥 BBQ / 🍽️ ร้านอาหาร / 🐶 สัตว์เลี้ยง OK |
| 13 | การเดินทาง | Checkbox | 🚐 Camper friendly / 🅿️ ที่จอดรถ / 🚗 รถเก๋งเข้าได้ / 🚙 ต้อง 4WD |
| 14 | กิจกรรม & กฎ | Checkbox | 🚬 สูบบุหรี่ได้ / 🎵 เปิดเพลงได้ / 🍺 ดื่มได้ / 🔥 มีพื้นที่ก่อไฟ (ไม่ติ๊ก = ไม่อนุญาต) |
| 15 | รูปภาพ | Image Upload | อัปโหลด min 5 รูป / เลือกรูปปก / Drag จัดลำดับ |
| 16 | ชื่อแคมป์ | Text Input | Max 50 ตัวอักษร |
| 17 | คำอธิบาย | Textarea | Max 500 ตัวอักษร |

### 3.3 Step 3: ตั้งราคาและเผยแพร่ (Page 18-24)

| Page | หัวข้อ | Input Type | ตัวเลือก / Details |
|------|--------|------------|-------------------|
| 18 | Step 3 Intro | Info + CTA | 'ตั้งราคาและเผยแพร่' → ปุ่ม Next |
| 19 | รูปแบบการจอง | Radio Card | 📋 Approve ทุกการจอง / ⚡ Instant Book |
| 20 | ราคาวันธรรมดา | Price Input | ฿___/คืน + ปุ่มดูราคาแคมป์ใกล้เคียง (Map comparison) |
| 21 | ราคาวันหยุด | Slider + Input | Premium __% (ศุกร์-เสาร์) / Range 0-99% |
| 22 | ส่วนลด | Checkbox + Input | ✅ First-timer 20% / ✅ Weekly 10% / ✅ Monthly 20% / ✅ Last-minute 10% |
| 23 | ข้อมูลติดต่อ | Form | ที่อยู่ Host / เบอร์โทร / เป็นธุรกิจจดทะเบียน? |
| 24 | Review & Publish | Preview + CTA | Preview listing ทั้งหมด → ปุ่ม Create Listing |

### 3.4 Flow Summary

| Step | Pages | Content |
|------|-------|---------|
| Step 1: บอกเราเกี่ยวกับแคมป์ | 0-7 (8 pages) | Intro → ประเภท → ที่ตั้ง → Pin → บรรยากาศ → ความจุ → โซน |
| Step 2: ทำให้โดดเด่น | 8-17 (10 pages) | Intro → ห้องน้ำ → ความสะดวก → อุปกรณ์ → อาหาร → การเดินทาง → กฎ → รูป → ชื่อ → คำอธิบาย |
| Step 3: ราคาและเผยแพร่ | 18-24 (7 pages) | Intro → การจอง → ราคาธรรมดา → ราคาหยุด → ส่วนลด → ติดต่อ → Review |
| **Total** | **25 pages** | |

---

## 4. Functional Requirements

### 4.1 Mode Switching Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-MODE-001 | Switch to Camp Host | ผู้ใช้กดปุ่ม 'Switch to Camp Host' ใน Header เพื่อเข้าสู่โหมด Host | High |
| FR-MODE-002 | Switch to Camper | Camp Host กดปุ่ม 'Switch to Camper' เพื่อกลับโหมดผู้จอง | High |
| FR-MODE-003 | First-time Detection | ถ้ายังไม่มี Listing → แสดง Onboarding (Page 0) | High |
| FR-MODE-004 | Existing Host | ถ้ามี Listing แล้ว → เข้าสู่ Host Dashboard | High |

### 4.2 Onboarding Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-ONB-001 | Progress Bar | แสดง Progress bar ที่ footer ทุกหน้า แสดงความคืบหน้า 3 Steps | High |
| FR-ONB-002 | Save & Exit | ปุ่ม 'Save & exit' ที่ header บันทึกความคืบหน้าและออกได้ | High |
| FR-ONB-003 | Questions Button | ปุ่ม 'Questions?' ที่ header ทุกหน้าเพื่อขอความช่วยเหลือ | Medium |
| FR-ONB-004 | Back/Next Navigation | ปุ่ม Back และ Next สำหรับ navigate ระหว่างหน้า | High |
| FR-ONB-005 | Resume Progress | กลับมาทำต่อจากหน้าที่ค้างไว้ได้ | High |
| FR-ONB-006 | Validation | Validate input ก่อน Next และแสดง error message | High |

### 4.3 Camp Type Selection (Page 2)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-TYPE-001 | Camp Type Options | แสดง 6 ตัวเลือก: ลานกางเต็นท์, เต็นท์พร้อมพัก, Glamping, บ้านพักธรรมชาติ, Campervan, ที่พักรูปแบบพิเศษ | High |
| FR-TYPE-002 | Card Selection UI | แสดงเป็น Card พร้อม Icon ใหญ่ + text สั้น, เลือกได้ 1 อย่าง | High |
| FR-TYPE-003 | Selection Highlight | Card ที่เลือกแล้วต้อง highlight ชัดเจน | High |
| FR-TYPE-004 | Auto Logic | ถ้าเลือก Campervan → auto require ที่จอดรถ ใน Page 13 | Medium |

### 4.4 Location Module (Page 3-4)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-LOC-001 | Address Input | กรอกที่อยู่ด้วย text input พร้อม autocomplete | High |
| FR-LOC-002 | Map Display | แสดงแผนที่ Mapbox พร้อม Pin ตำแหน่ง | High |
| FR-LOC-003 | Pin Adjustment | Drag Pin เพื่อปรับตำแหน่งที่แน่นอน | High |
| FR-LOC-004 | Address Confirmation | แสดง Address fields ให้ยืนยัน/แก้ไข | High |
| FR-LOC-005 | Location Privacy | Toggle 'แสดงตำแหน่งที่แน่นอน' (approximate vs exact) | Medium |

### 4.5 Environment Selection (Page 5)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-ENV-001 | Environment Options | 8 ตัวเลือก: ใกล้กรุงเทพ, วิวภูเขา, ทะเลหมอก, ริมแม่น้ำ, ริมทะเล, ป่าเขา, ทุ่งนา, ดูดาว | High |
| FR-ENV-002 | Multi Select | เลือกได้หลายอัน (Pill buttons) | High |
| FR-ENV-003 | Minimum Selection | ต้องเลือกอย่างน้อย 1 อย่าง | High |

### 4.6 Capacity Module (Page 6)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-CAP-001 | Max Campers | Number stepper สำหรับจำนวน Camper สูงสุด | High |
| FR-CAP-002 | Tent Spots | Number stepper สำหรับจำนวนจุดกาง/ยูนิต | High |
| FR-CAP-003 | Bathrooms | Number stepper สำหรับจำนวนห้องน้ำ | High |

### 4.7 Zone Management (Page 7)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-ZONE-001 | Zone Creation | สร้างโซน/ยูนิตใหม่ด้วยปุ่ม 'Add Zone' | High |
| FR-ZONE-002 | Zone Name | ตั้งชื่อโซน (เช่น 'โซน A', 'ริมน้ำ') | High |
| FR-ZONE-003 | Zone Capacity | กำหนดความจุของแต่ละโซน | High |
| FR-ZONE-004 | Zone Price | กำหนดราคาของแต่ละโซน (optional, default = base price) | Medium |
| FR-ZONE-005 | Multiple Zones | สร้างได้หลายโซน, แสดงเป็น list | High |
| FR-ZONE-006 | Edit/Delete Zone | แก้ไขหรือลบโซนที่สร้างแล้ว | High |
| FR-ZONE-007 | Skip Option | ถ้าไม่มีหลายโซน สามารถข้ามได้ (ใช้ค่า default จาก Page 6) | Medium |

### 4.8 Facilities Module (Page 9-14)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-FAC-001 | Bathroom Options | Checkbox: มีห้องน้ำ, ห้องน้ำส่วนตัว, น้ำอุ่น | High |
| FR-FAC-002 | Convenience | Checkbox: ปลั๊กไฟ, สัญญาณมือถือ, Wi-Fi | High |
| FR-FAC-003 | Equipment Rental | Checkbox: เต็นท์, ทาร์ป, ปลั๊กพกพา | Medium |
| FR-FAC-004 | Food Policy | Radio: ทำอาหารได้ / ห้ามทำอาหาร | High |
| FR-FAC-005 | Amenities | Checkbox: BBQ, ร้านอาหาร, สัตว์เลี้ยงเข้าได้ | Medium |
| FR-FAC-006 | Transportation | Checkbox: Camper friendly, ที่จอดรถ, รถเก๋งเข้าได้, ต้อง 4WD | High |
| FR-FAC-007 | Rules | Checkbox: สูบบุหรี่ได้, เปิดเพลงได้, ดื่มได้, พื้นที่ก่อไฟ (ไม่ติ๊ก = ไม่อนุญาต) | High |

### 4.9 Photo Upload Module (Page 15)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-IMG-001 | Upload Photos | อัปโหลดรูปได้หลายรูปพร้อมกัน | High |
| FR-IMG-002 | Minimum Photos | ต้องอัปโหลดอย่างน้อย 5 รูป | High |
| FR-IMG-003 | Cover Photo | เลือกรูปปก (Cover Photo) | High |
| FR-IMG-004 | Reorder Photos | Drag & Drop เพื่อจัดลำดับรูป | Medium |
| FR-IMG-005 | Delete Photo | ลบรูปที่ไม่ต้องการได้ | High |
| FR-IMG-006 | Photo Preview | แสดง Preview รูปหลังอัปโหลด | High |

### 4.10 Camp Details Module (Page 16-17)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-DET-001 | Camp Title | Text input สำหรับชื่อแคมป์ (max 50 chars) | High |
| FR-DET-002 | Character Counter | แสดงจำนวนตัวอักษรที่พิมพ์/max | Medium |
| FR-DET-003 | Camp Description | Textarea สำหรับคำอธิบาย (max 500 chars) | High |
| FR-DET-004 | Description Hint | แสดงคำแนะนำในการเขียนคำอธิบาย | Low |

### 4.11 Booking Settings Module (Page 19)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-BOOK-001 | Booking Type | Radio: Approve ทุกการจอง / Instant Book | High |
| FR-BOOK-002 | Card Selection | แสดงเป็น Card พร้อม description | High |
| FR-BOOK-003 | Recommended Badge | แสดง 'Recommended' badge สำหรับ Approve first | Low |

### 4.12 Pricing Module (Page 20-22)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-PRC-001 | Base Price | Input ราคาวันธรรมดา (THB/คืน) | High |
| FR-PRC-002 | Price Comparison | ปุ่ม 'ดูราคาแคมป์ใกล้เคียง' เปิด Map comparison | Medium |
| FR-PRC-003 | Weekend Premium | Slider + Input สำหรับ % premium วันหยุด (0-99%) | High |
| FR-PRC-004 | Weekend Price Display | แสดงราคาวันหยุดที่คำนวณแล้ว | High |
| FR-PRC-005 | First-timer Discount | Checkbox + Input สำหรับส่วนลด Camper ใหม่ | Medium |
| FR-PRC-006 | Weekly Discount | Checkbox + Input สำหรับส่วนลด 7+ คืน | Medium |
| FR-PRC-007 | Monthly Discount | Checkbox + Input สำหรับส่วนลด 28+ คืน | Medium |
| FR-PRC-008 | Last-minute Discount | Checkbox + Input สำหรับส่วนลดจองภายใน 14 วัน | Low |

### 4.13 Contact Info Module (Page 23)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-CON-001 | Host Address | Form สำหรับที่อยู่ Host (ไม่แสดงต่อ Camper) | High |
| FR-CON-002 | Phone Number | Input เบอร์โทรติดต่อ | High |
| FR-CON-003 | Business Registration | Radio: เป็นธุรกิจจดทะเบียน Yes/No | Medium |

### 4.14 Review & Publish Module (Page 24)

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-REV-001 | Listing Preview | แสดง Preview listing ทั้งหมดก่อน publish | High |
| FR-REV-002 | Edit Sections | ลิงก์กลับไปแก้ไขแต่ละ section ได้ | Medium |
| FR-REV-003 | Create Listing CTA | ปุ่ม 'Create Listing' เพื่อเผยแพร่ | High |
| FR-REV-004 | Success State | แสดงหน้า Success หลัง publish สำเร็จ | High |

---

## 5. Host Dashboard Requirements

### 5.1 Dashboard Navigation

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-DASH-001 | Top Navigation | แสดง tabs: Today, Calendar, Listings, Messages | High |
| FR-DASH-002 | Switch to Camper | ปุ่ม 'Switch to Camper' ใน header | High |
| FR-DASH-003 | Profile Menu | Profile dropdown menu | High |

### 5.2 Today Tab

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-TODAY-001 | Today/Upcoming Tabs | Sub-tabs สำหรับการจองวันนี้และที่จะมาถึง | High |
| FR-TODAY-002 | Reservation List | แสดงรายการการจอง | High |
| FR-TODAY-003 | Empty State | แสดง 'You don't have any reservations' + CTA | High |
| FR-TODAY-004 | Complete Listing CTA | ถ้า Listing ไม่สมบูรณ์ แสดงปุ่ม 'Complete your listing' | High |

### 5.3 Calendar Tab

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-CAL-001 | Month View | แสดงปฏิทินแบบเดือนพร้อมราคาในแต่ละวัน | High |
| FR-CAL-002 | Price Settings Panel | Panel ด้านขวาสำหรับตั้งค่าราคา | High |
| FR-CAL-003 | Availability Settings | ตั้งค่า min/max nights, advance notice | Medium |
| FR-CAL-004 | Block Dates | บล็อกวันที่ไม่รับจอง | Medium |
| FR-CAL-005 | Today Indicator | Highlight วันนี้บนปฏิทิน | High |

### 5.4 Listings Tab

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-LIST-001 | Listing Cards | แสดง Listing เป็น Card พร้อมรูป, ชื่อ, สถานะ | High |
| FR-LIST-002 | Status Badge | แสดงสถานะ: In progress, Published, Paused | High |
| FR-LIST-003 | Add New Listing | ปุ่ม '+' เพื่อสร้าง Listing ใหม่ | Medium |
| FR-LIST-004 | Edit Listing | คลิกเพื่อแก้ไข Listing | High |

### 5.5 Messages Tab

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-MSG-001 | Message List | แสดงรายการข้อความจาก Campers | High |
| FR-MSG-002 | All/Unread Filter | Filter: All, Unread | Medium |
| FR-MSG-003 | Search Messages | ค้นหาข้อความ | Low |
| FR-MSG-004 | Message Thread | แสดงประวัติสนทนา | High |
| FR-MSG-005 | Empty State | แสดง 'You don't have any messages' | High |

---

## 6. Data Requirements

### 6.1 Camp Listing Data Model

| Field | Type | Description | Required | Page |
|-------|------|-------------|----------|------|
| listingId | string | UUID รหัส Listing | Auto | - |
| hostId | string | รหัส Host เจ้าของ | Auto | - |
| campType | enum | tent_pitch / ready_tent / glamping / cabin / campervan / special | Yes | 2 |
| location | object | { address, lat, lng, province, district } | Yes | 3-4 |
| showExactLocation | boolean | แสดงตำแหน่งที่แน่นอนหรือไม่ | Yes | 4 |
| environments | string[] | บรรยากาศ (multi-select) | Yes | 5 |
| maxCampers | number | จำนวน Camper สูงสุด | Yes | 6 |
| tentSpots | number | จำนวนจุดกาง | Yes | 6 |
| bathrooms | number | จำนวนห้องน้ำ | Yes | 6 |
| zones | Zone[] | รายการโซน/ยูนิต | No | 7 |
| bathroomFeatures | string[] | มีห้องน้ำ, ส่วนตัว, น้ำอุ่น | Yes | 9 |
| conveniences | string[] | ปลั๊กไฟ, สัญญาณ, Wi-Fi | No | 10 |
| rentals | string[] | อุปกรณ์ให้เช่า | No | 11 |
| canCook | boolean | ทำอาหารได้หรือไม่ | Yes | 12 |
| amenities | string[] | BBQ, ร้านอาหาร, สัตว์เลี้ยง | No | 12 |
| transportation | string[] | Camper friendly, ที่จอดรถ, 4WD | No | 13 |
| rules | object | { smoking, music, alcohol, firepit } | Yes | 14 |
| images | string[] | URLs รูปภาพ (min 5) | Yes | 15 |
| coverImageIndex | number | Index รูปปก | Yes | 15 |
| title | string | ชื่อแคมป์ (max 50) | Yes | 16 |
| description | string | คำอธิบาย (max 500) | Yes | 17 |

### 6.2 Pricing Data Model

| Field | Type | Description | Required | Page |
|-------|------|-------------|----------|------|
| instantBook | boolean | เปิด Instant Book | Yes | 19 |
| basePrice | number | ราคาวันธรรมดา (THB) | Yes | 20 |
| weekendPremium | number | % premium วันหยุด (0-99) | Yes | 21 |
| discounts | object | { firstTimer, weekly, monthly, lastMinute } | No | 22 |

### 6.3 Zone Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| zoneId | string | UUID รหัสโซน | Auto |
| name | string | ชื่อโซน (เช่น 'โซน A') | Yes |
| capacity | number | ความจุของโซน | Yes |
| price | number | ราคาโซน (null = ใช้ base price) | No |

### 6.4 Host Contact Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| address | object | ที่อยู่ Host (ไม่แสดงต่อ Camper) | Yes |
| phone | string | เบอร์โทรติดต่อ | Yes |
| isBusiness | boolean | เป็นธุรกิจจดทะเบียน | Yes |

---

## 7. User Interface Requirements

### 7.1 Design System
- **Primary Color:** Green (#2E7D32)
- **Font:** DM Sans
- **Icons:** Lucide React + Custom Camp Icons
- **Components:** Shadcn-UI (Radix)
- **Animation:** Framer Motion

### 7.2 Onboarding Page Layout
- **Header:** Logo (left) + Questions? + Save & exit (right)
- **Content:** Centered, max-width 600px
- **Footer:** Progress bar (3 segments) + Back/Next buttons
- **1 Page = 1 Question:** ทุกหน้ามีเพียงคำถามเดียว

### 7.3 Component Specifications

#### 7.3.1 Card Selection (Page 2)
- Grid: 2-3 cards per row
- Card: Large icon + Short label
- Selected state: Border highlight + checkmark

#### 7.3.2 Pill Buttons (Page 5)
- Layout: Wrap, horizontal scroll on mobile
- Style: Rounded pill with icon + text
- Selected state: Filled background

#### 7.3.3 Number Stepper (Page 6)
- Layout: Label + Minus button + Number + Plus button
- Min/Max validation

#### 7.3.4 Zone List (Page 7)
- Layout: Expandable cards
- Actions: Add, Edit, Delete
- Empty state: 'Add your first zone' CTA

### 7.4 Dashboard Layout
- **Header:** Logo + Navigation tabs + Switch to Camper + Profile
- **Content:** Full width, responsive grid
- **Mobile:** Bottom navigation

---

## 8. Non-Functional Requirements

### 8.1 Performance

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-PERF-001 | Page Transition Time | < 300ms |
| NFR-PERF-002 | Image Upload Time | < 5 seconds per image |
| NFR-PERF-003 | Dashboard Load Time | < 2 seconds |
| NFR-PERF-004 | Map Render Time | < 1 second |
| NFR-PERF-005 | Auto-save Interval | Every 30 seconds |

### 8.2 Usability

| NFR ID | Requirement | Target |
|--------|-------------|--------|
| NFR-USA-001 | Onboarding Completion Rate | > 80% |
| NFR-USA-002 | Time to Complete Onboarding | < 15 minutes |
| NFR-USA-003 | Mobile Responsive | 100% functional on mobile |
| NFR-USA-004 | Error Recovery | Resume from any point |

### 8.3 Security

| NFR ID | Requirement | Description |
|--------|-------------|-------------|
| NFR-SEC-001 | Authentication Required | ต้อง Login ก่อนเข้า Host mode |
| NFR-SEC-002 | Host Data Privacy | ที่อยู่ Host ไม่แสดงต่อ Camper |
| NFR-SEC-003 | Image Upload Validation | ตรวจสอบ file type และ size |

---

*End of Document*
