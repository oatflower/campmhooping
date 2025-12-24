# Software Requirements Specification (SRS)
# Campy - ระบบจองแคมป์ปิ้ง

**Camping Booking Platform**

- **Version:** 1.0
- **Date:** 19 December 2568
- **Prepared by:** Campy Development Team

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [System Constraints](#5-system-constraints)
6. [Use Cases](#6-use-cases)
7. [Data Requirements](#7-data-requirements)
8. [User Interface Requirements](#8-user-interface-requirements)
9. [Acceptance Criteria](#9-acceptance-criteria)

---

## 1. Introduction

### 1.1 Purpose
เอกสารนี้เป็น Software Requirements Specification (SRS) สำหรับระบบ Campy ซึ่งเป็นแพลตฟอร์มจองแคมป์ปิ้งออนไลน์ โดยมีวัตถุประสงค์เพื่อกำหนดความต้องการทั้งด้านฟังก์ชันและที่ไม่ใช่ฟังก์ชันของระบบ รวมถึงข้อจำกัดและเงื่อนไขต่างๆ ที่เกี่ยวข้อง

### 1.2 Project Objectives
- เป็นแพลตฟอร์มกลางในการค้นหาและจองสถานที่แคมป์ปิ้งทั่วประเทศไทย
- อำนวยความสะดวกให้ผู้ใช้สามารถค้นหา เปรียบเทียบ และจองแคมป์ได้อย่างง่ายดาย
- ให้ข้อมูลที่ครบถ้วนเกี่ยวกับสถานที่แคมป์ปิ้ง รวมถึงสิ่งอำนวยความสะดวก ราคา และรีวิว
- รองรับการชำระเงินออนไลน์ที่ปลอดภัยและหลากหลายช่องทาง
- ให้บริการร้านค้าอุปกรณ์แคมป์ปิ้ง (Gear Shop) เสริม

### 1.3 Scope
ขอบเขตของระบบ Campy ประกอบด้วย:
- ระบบค้นหาและกรองแคมป์ปิ้งตามเกณฑ์ต่างๆ
- ระบบแสดงรายละเอียดแคมป์พร้อมรูปภาพ แผนที่ และข้อมูลสภาพอากาศ
- ระบบจองที่พักและ Add-ons
- ระบบชำระเงินออนไลน์
- ระบบ Favorites/Wishlist
- ระบบรีวิวและให้คะแนน
- ร้านค้าอุปกรณ์แคมป์ปิ้ง
- รองรับหลายภาษา (7 ภาษา)

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| **Camp** | สถานที่แคมป์ปิ้งหรือที่พัก |
| **Accommodation** | ประเภทที่พัก เช่น เต็นท์, โดม, กระท่อม |
| **Add-ons** | บริการเสริมที่สามารถเพิ่มในการจอง |
| **OTP** | One-Time Password รหัสยืนยันตัวตนแบบใช้ครั้งเดียว |
| **SRS** | Software Requirements Specification |
| **UI** | User Interface |
| **UX** | User Experience |
| **API** | Application Programming Interface |

---

## 2. System Overview

### 2.1 System Description
Campy เป็นแพลตฟอร์มจองแคมป์ปิ้งออนไลน์ที่พัฒนาด้วย React และ TypeScript โดยเป็น Single Page Application (SPA) ที่มีส่วนติดต่อผู้ใช้ที่ทันสมัย รองรับการใช้งานทั้งบน Desktop และ Mobile ระบบมีแคมป์ปิ้ง 24 แห่ง กระจายใน 7 จังหวัดทั่วประเทศไทย

### 2.2 Primary Users

| User Type | Description | Primary Activities |
|-----------|-------------|-------------------|
| Guest User | ผู้ใช้ทั่วไปที่ยังไม่ล็อกอิน | ค้นหา, ดูรายละเอียดแคมป์, ดูอุปกรณ์ |
| Registered User | ผู้ใช้ที่ล็อกอินแล้ว | จอง, ชำระเงิน, บันทึก Favorites, เขียนรีวิว |
| Admin | ผู้ดูแลระบบ (Future) | จัดการแคมป์, ดูรายงาน, จัดการผู้ใช้ |

### 2.3 Operating Environment
ระบบรองรับการทำงานบน:
- **Web Browsers:** Chrome, Firefox, Safari, Edge (เวอร์ชันล่าสุด)
- **Mobile Browsers:** Safari iOS, Chrome Android
- **Screen Sizes:** Desktop (1920px+), Tablet (768px-1024px), Mobile (320px-767px)

### 2.4 System Architecture

**Frontend Stack:**
- React 18.3.1 - UI Framework
- TypeScript 5.8.3 - Type Safety
- Vite 5.4.19 - Build Tool
- Tailwind CSS 3.4.17 - Styling
- Shadcn-UI - Component Library
- TanStack React Query 5.83.0 - Data Fetching
- React Router DOM 6.30.1 - Routing

---

## 3. Functional Requirements

### 3.1 Authentication Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-AUTH-001 | Email Input | ผู้ใช้สามารถกรอก email เพื่อเริ่มกระบวนการล็อกอิน | High |
| FR-AUTH-002 | OTP Generation | ระบบสร้าง OTP 6 หลักและส่งไปยัง email ที่ระบุ | High |
| FR-AUTH-003 | OTP Verification | ผู้ใช้กรอก OTP 6 หลักเพื่อยืนยันตัวตน | High |
| FR-AUTH-004 | OTP Resend | ผู้ใช้สามารถขอส่ง OTP ใหม่หลังจาก 60 วินาที | Medium |
| FR-AUTH-005 | Social Login | รองรับ Google, Facebook, Apple Sign-in (Future) | Low |
| FR-AUTH-006 | Logout | ผู้ใช้สามารถออกจากระบบได้ | High |

### 3.2 Search and Filter Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-SEARCH-001 | Location Search | ค้นหาตามจังหวัด (7 จังหวัด) | High |
| FR-SEARCH-002 | Date Range | เลือกวันเช็คอิน-เช็คเอาท์ | High |
| FR-SEARCH-003 | Guest Count | ระบุจำนวน ผู้ใหญ่/เด็ก/ทารก/สัตว์เลี้ยง | High |
| FR-SEARCH-004 | Price Filter | กรองตามช่วงราคา ฿0 - ฿5,000 | High |
| FR-SEARCH-005 | Facility Filter | กรองตามสิ่งอำนวยความสะดวก | Medium |
| FR-SEARCH-006 | Rating Filter | กรองตามคะแนนขั้นต่ำ | Medium |
| FR-SEARCH-007 | Category Filter | กรองตามหมวดหมู่ (glamping, ใกล้กรุงเทพ, ฯลฯ) | High |
| FR-SEARCH-008 | Accommodation Type | กรองตามประเภทที่พัก (tent, dome, cabin) | Medium |
| FR-SEARCH-009 | Search Persistence | บันทึกการค้นหาล่าสุดใน localStorage | Low |

### 3.3 Camp Display Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-CAMP-001 | Camp Listing | แสดงรายการแคมป์ในรูปแบบ Grid/List | High |
| FR-CAMP-002 | Map View | แสดงแคมป์บนแผนที่ Mapbox | High |
| FR-CAMP-003 | Camp Detail Page | แสดงรายละเอียดแคมป์ครบถ้วน | High |
| FR-CAMP-004 | Image Gallery | แสดงรูปภาพแคมป์พร้อม Lightbox | High |
| FR-CAMP-005 | Weather Display | แสดงพยากรณ์อากาศ 5 วัน | Medium |
| FR-CAMP-006 | Facility Icons | แสดง icons สิ่งอำนวยความสะดวก | Medium |
| FR-CAMP-007 | Price Display | แสดงราคาต่อคืนตามประเภทที่พัก | High |

### 3.4 Booking Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-BOOK-001 | Accommodation Selection | เลือกประเภทที่พัก (tent/dome/cabin) | High |
| FR-BOOK-002 | Date Selection | เลือกวันเข้าพัก-ออก | High |
| FR-BOOK-003 | Guest Count | ระบุจำนวนแขก | High |
| FR-BOOK-004 | Extra Guest Charge | คำนวณค่าใช้จ่ายแขกเพิ่มเติม | Medium |
| FR-BOOK-005 | Add-ons Selection | เลือก add-ons (BBQ, อาหารเช้า, ฯลฯ) | Medium |
| FR-BOOK-006 | Price Calculation | คำนวณราคารวมทั้งหมด | High |
| FR-BOOK-007 | Booking Summary | แสดงสรุปการจองก่อนชำระเงิน | High |

### 3.5 Payment Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-PAY-001 | Credit Card Payment | ชำระเงินด้วยบัตรเครดิต/เดบิต | High |
| FR-PAY-002 | Bank Transfer | ชำระเงินผ่านการโอนเงิน | High |
| FR-PAY-003 | Mobile Wallet | ชำระเงินผ่าน PromptPay, LINE Pay | High |
| FR-PAY-004 | Card Validation | ตรวจสอบข้อมูลบัตรก่อนชำระ | High |
| FR-PAY-005 | Transaction ID | สร้างหมายเลขธุรกรรม | High |
| FR-PAY-006 | Payment Confirmation | แสดงหน้ายืนยันการชำระเงิน | High |

### 3.6 Favorites Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-FAV-001 | Add to Favorites | กดหัวใจเพื่อบันทึกแคมป์ที่ชอบ | Medium |
| FR-FAV-002 | Remove from Favorites | ลบแคมป์ออกจาก Favorites | Medium |
| FR-FAV-003 | Favorites Page | แสดงรายการแคมป์ที่บันทึกไว้ | Medium |
| FR-FAV-004 | Persistence | บันทึก Favorites ใน localStorage | Medium |

### 3.7 Review Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-REV-001 | View Reviews | แสดงรีวิวของแคมป์ | High |
| FR-REV-002 | Submit Review | เขียนรีวิวและให้คะแนน 1-5 ดาว | Medium |
| FR-REV-003 | Helpful Vote | กด helpful บนรีวิวที่เป็นประโยชน์ | Low |
| FR-REV-004 | Review Persistence | บันทึกรีวิวใหม่ใน localStorage | Medium |

### 3.8 Gear Shop Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-GEAR-001 | Product Listing | แสดงรายการอุปกรณ์แคมป์ปิ้ง 17 รายการ | Medium |
| FR-GEAR-002 | Category Filter | กรองตามหมวดหมู่ (เฟอร์นิเจอร์, ไฟ, ฯลฯ) | Medium |
| FR-GEAR-003 | Price Range | กรองตามช่วงราคา | Low |
| FR-GEAR-004 | Product Detail | แสดงรายละเอียดสินค้า | Medium |

### 3.9 Internationalization Module

| Req ID | Requirement | Description | Priority |
|--------|-------------|-------------|----------|
| FR-I18N-001 | Multi-language Support | รองรับ 7 ภาษา (TH, EN, ZH, KO, JA, DE, FR) | Medium |
| FR-I18N-002 | Auto Detection | ตรวจจับภาษาจาก Browser | Low |
| FR-I18N-003 | Language Preference | บันทึกการเลือกภาษาของผู้ใช้ | Low |

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

| NFR ID | Requirement | Target Value |
|--------|-------------|--------------|
| NFR-PERF-001 | Initial Page Load Time | < 3 seconds (Desktop), < 5 seconds (Mobile 3G) |
| NFR-PERF-002 | Time to Interactive (TTI) | < 4 seconds |
| NFR-PERF-003 | Search Response Time | < 500ms |
| NFR-PERF-004 | Image Load Time | < 2 seconds per image |
| NFR-PERF-005 | Concurrent Users | รองรับ 1,000 users พร้อมกัน |
| NFR-PERF-006 | API Response Time | < 1 second (Weather API) |

### 4.2 Security Requirements

| NFR ID | Requirement | Description |
|--------|-------------|-------------|
| NFR-SEC-001 | Authentication | OTP-based email verification |
| NFR-SEC-002 | Data Encryption | HTTPS/TLS สำหรับทุก connections |
| NFR-SEC-003 | Input Validation | ตรวจสอบข้อมูล input ทุกช่อง |
| NFR-SEC-004 | XSS Prevention | ป้องกัน Cross-Site Scripting |
| NFR-SEC-005 | CSRF Protection | ป้องกัน Cross-Site Request Forgery |
| NFR-SEC-006 | Payment Security | PCI DSS compliance สำหรับการชำระเงิน |
| NFR-SEC-007 | API Key Protection | เก็บ API keys ใน environment variables |

### 4.3 Usability Requirements

| NFR ID | Requirement | Description |
|--------|-------------|-------------|
| NFR-USA-001 | Responsive Design | รองรับทุกขนาดหน้าจอ (320px - 4K) |
| NFR-USA-002 | Mobile First | ออกแบบเน้น Mobile experience |
| NFR-USA-003 | Intuitive Navigation | Navigation ที่ใช้งานง่าย |
| NFR-USA-004 | Loading States | แสดง Skeleton loading ขณะโหลด |
| NFR-USA-005 | Error Handling | แสดงข้อความ error ที่เข้าใจง่าย |
| NFR-USA-006 | Accessibility | รองรับ WCAG 2.1 Level AA |

### 4.4 Reliability Requirements

| NFR ID | Requirement | Target Value |
|--------|-------------|--------------|
| NFR-REL-001 | System Availability | 99.9% uptime |
| NFR-REL-002 | Data Persistence | ไม่สูญหายข้อมูลการจอง |
| NFR-REL-003 | Error Recovery | ระบบกู้คืนได้ภายใน 5 นาที |
| NFR-REL-004 | Backup Frequency | Daily backup |

### 4.5 Scalability Requirements

| NFR ID | Requirement | Description |
|--------|-------------|-------------|
| NFR-SCA-001 | Horizontal Scaling | รองรับการเพิ่ม server instances |
| NFR-SCA-002 | Database Scaling | รองรับการขยาย database |
| NFR-SCA-003 | CDN Support | รองรับ Content Delivery Network |
| NFR-SCA-004 | Caching Strategy | มี caching layer สำหรับ static content |

---

## 5. System Constraints

### 5.1 Technical Constraints
- **Platform:** Web-based application (SPA)
- **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript Required:** ต้องเปิด JavaScript
- **Internet Connection:** ต้องมีการเชื่อมต่ออินเทอร์เน็ต

### 5.2 Technology Stack Constraints

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Build Tool | Vite | 5.4.19 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | Shadcn-UI (Radix) | Latest |
| State Management | React Query | 5.83.0 |
| Routing | React Router | 6.30.1 |
| Form Handling | React Hook Form | 7.61.1 |
| Validation | Zod | 3.25.76 |
| i18n | i18next | 25.7.3 |
| Maps | Mapbox GL | 3.17.0 |
| Date Handling | date-fns | 3.6.0 |

### 5.3 Third-Party Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| OpenWeatherMap API | Weather forecast data | Integrated |
| Mapbox GL | Interactive maps | Integrated |
| Stripe/Payment Gateway | Payment processing | Ready to integrate |
| Google OAuth | Social login | Ready to integrate |
| Facebook OAuth | Social login | Ready to integrate |
| Apple Sign-in | Social login | Ready to integrate |

### 5.4 Legal and Compliance Constraints
- **PDPA:** ปฏิบัติตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล
- **Terms of Service:** ต้องมีเงื่อนไขการใช้บริการ
- **Privacy Policy:** ต้องมีนโยบายความเป็นส่วนตัว
- **Payment Regulations:** ปฏิบัติตามกฎหมายธุรกรรมอิเล็กทรอนิกส์

---

## 6. Use Cases

### 6.1 UC-001: Search for Camps

| Element | Description |
|---------|-------------|
| Use Case ID | UC-001 |
| Name | Search for Camps |
| Actors | Guest User, Registered User |
| Description | ผู้ใช้ค้นหาแคมป์ตามเกณฑ์ที่กำหนด |
| Preconditions | ผู้ใช้อยู่ในหน้าแรกหรือหน้ารายการแคมป์ |
| Main Flow | 1. ผู้ใช้เลือกจังหวัด<br>2. ผู้ใช้เลือกวันที่เข้าพัก-ออก<br>3. ผู้ใช้ระบุจำนวนแขก<br>4. ผู้ใช้กดค้นหา<br>5. ระบบแสดงผลลัพธ์ |
| Alternative Flow | A1: ใช้ตัวกรองเพิ่มเติม (ราคา, สิ่งอำนวยความสะดวก) |
| Postconditions | แสดงรายการแคมป์ที่ตรงตามเกณฑ์ |

### 6.2 UC-002: View Camp Details

| Element | Description |
|---------|-------------|
| Use Case ID | UC-002 |
| Name | View Camp Details |
| Actors | Guest User, Registered User |
| Description | ผู้ใช้ดูรายละเอียดของแคมป์ |
| Preconditions | มีรายการแคมป์แสดงอยู่ |
| Main Flow | 1. ผู้ใช้คลิกที่แคมป์<br>2. ระบบแสดงหน้ารายละเอียด<br>3. ผู้ใช้ดูรูปภาพ, ข้อมูล, รีวิว<br>4. ผู้ใช้ดูพยากรณ์อากาศ |
| Alternative Flow | A1: ผู้ใช้เปิด Lightbox ดูรูปเต็ม<br>A2: ผู้ใช้ดูตำแหน่งบนแผนที่ |
| Postconditions | ผู้ใช้ได้รับข้อมูลครบถ้วนของแคมป์ |

### 6.3 UC-003: Make a Booking

| Element | Description |
|---------|-------------|
| Use Case ID | UC-003 |
| Name | Make a Booking |
| Actors | Registered User |
| Description | ผู้ใช้ทำการจองแคมป์ |
| Preconditions | ผู้ใช้ล็อกอินแล้ว, อยู่ในหน้ารายละเอียดแคมป์ |
| Main Flow | 1. เลือกประเภทที่พัก<br>2. เลือกวันเข้าพัก-ออก<br>3. ระบุจำนวนแขก<br>4. เลือก add-ons (optional)<br>5. ตรวจสอบสรุปการจอง<br>6. กดจอง |
| Alternative Flow | A1: เพิ่มแขกเกินจำนวนมาตรฐาน (มีค่าใช้จ่ายเพิ่ม) |
| Postconditions | สร้างรายการจองและนำไปหน้าชำระเงิน |

### 6.4 UC-004: Process Payment

| Element | Description |
|---------|-------------|
| Use Case ID | UC-004 |
| Name | Process Payment |
| Actors | Registered User |
| Description | ผู้ใช้ชำระเงินค่าจอง |
| Preconditions | มีรายการจองที่รอชำระเงิน |
| Main Flow | 1. เลือกวิธีชำระเงิน<br>2. กรอกข้อมูลการชำระ<br>3. ยืนยันการชำระเงิน<br>4. รอประมวลผล<br>5. รับหน้ายืนยัน |
| Alternative Flow | A1: ชำระด้วยบัตรเครดิต<br>A2: ชำระผ่านโอนเงิน<br>A3: ชำระผ่าน PromptPay |
| Postconditions | การจองสำเร็จ, ได้รับ Transaction ID |

### 6.5 UC-005: User Authentication

| Element | Description |
|---------|-------------|
| Use Case ID | UC-005 |
| Name | User Authentication (OTP) |
| Actors | Guest User |
| Description | ผู้ใช้เข้าสู่ระบบด้วย Email OTP |
| Preconditions | ผู้ใช้มี email ที่ใช้งานได้ |
| Main Flow | 1. กรอก email<br>2. กดส่ง OTP<br>3. รับ OTP ทาง email<br>4. กรอก OTP 6 หลัก<br>5. ยืนยัน |
| Alternative Flow | A1: ขอส่ง OTP ใหม่หลัง 60 วินาที<br>A2: ใช้ Social Login |
| Postconditions | ผู้ใช้เข้าสู่ระบบสำเร็จ |

### 6.6 UC-006: Manage Favorites

| Element | Description |
|---------|-------------|
| Use Case ID | UC-006 |
| Name | Manage Favorites |
| Actors | Registered User |
| Description | ผู้ใช้จัดการรายการแคมป์ที่ชื่นชอบ |
| Preconditions | ผู้ใช้ล็อกอินแล้ว |
| Main Flow | 1. กดไอคอนหัวใจบนแคมป์<br>2. แคมป์ถูกเพิ่มเข้า Favorites<br>3. ดู Favorites ในหน้าที่กำหนด |
| Alternative Flow | A1: ลบแคมป์ออกจาก Favorites |
| Postconditions | รายการ Favorites ถูกอัพเดท |

---

## 7. Data Requirements

### 7.1 Camp Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | number | รหัสแคมป์ | Yes |
| name | string | ชื่อแคมป์ (ภาษาไทย) | Yes |
| nameEn | string | ชื่อแคมป์ (ภาษาอังกฤษ) | Yes |
| location | string | ตำแหน่ง/พื้นที่ | Yes |
| province | string | จังหวัด | Yes |
| description | string | คำอธิบายแคมป์ | Yes |
| images | string[] | URLs รูปภาพ | Yes |
| rating | number | คะแนนรีวิว (1-5) | Yes |
| reviewCount | number | จำนวนรีวิว | Yes |
| pricePerNight | number | ราคาเริ่มต้นต่อคืน | Yes |
| accommodationType | enum | tent / dome / cabin | Yes |
| highlights | string[] | จุดเด่น | Yes |
| facilities | string[] | สิ่งอำนวยความสะดวก | Yes |
| maxGuests | number | จำนวนแขกสูงสุด | Yes |
| coordinates | object | lat, lng | Yes |
| isBeginner | boolean | เหมาะกับมือใหม่ | No |
| isPopular | boolean | ยอดนิยม | No |
| distanceFromBangkok | string | ระยะทางจากกรุงเทพ | No |

### 7.2 Accommodation Option Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| type | string | ประเภทที่พัก | Yes |
| name | string | ชื่อที่พัก | Yes |
| pricePerNight | number | ราคาต่อคืน | Yes |
| maxGuests | number | จำนวนแขกมาตรฐาน | Yes |
| extraAdultPrice | number | ค่าผู้ใหญ่เพิ่ม | Yes |
| extraChildPrice | number | ค่าเด็กเพิ่ม | Yes |
| amenities | string[] | สิ่งอำนวยความสะดวก | Yes |
| availability | boolean | พร้อมจอง | Yes |

### 7.3 Booking Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| bookingId | string | รหัสการจอง | Yes |
| campId | number | รหัสแคมป์ | Yes |
| userId | string | รหัสผู้ใช้ | Yes |
| accommodationId | string | รหัสที่พัก | Yes |
| checkIn | Date | วันเช็คอิน | Yes |
| checkOut | Date | วันเช็คเอาท์ | Yes |
| adults | number | จำนวนผู้ใหญ่ | Yes |
| children | number | จำนวนเด็ก | Yes |
| selectedAddons | string[] | add-ons ที่เลือก | No |
| totalPrice | number | ราคารวม | Yes |
| status | enum | pending / confirmed / cancelled | Yes |
| transactionId | string | รหัสธุรกรรม | Yes |
| createdAt | Date | วันที่สร้าง | Yes |

### 7.4 Gear Data Model

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | number | รหัสสินค้า | Yes |
| name | string | ชื่อสินค้า (ไทย) | Yes |
| nameEn | string | ชื่อสินค้า (อังกฤษ) | Yes |
| category | string | หมวดหมู่ | Yes |
| price | number | ราคา | Yes |
| originalPrice | number | ราคาเดิม | No |
| images | string[] | รูปสินค้า | Yes |
| rating | number | คะแนน | Yes |
| features | string[] | คุณสมบัติ | Yes |

### 7.5 Data Relationships
ความสัมพันธ์ระหว่างข้อมูล:
- **Camp (1) → (N) Accommodation Options:** แคมป์มีหลายตัวเลือกที่พัก
- **Camp (1) → (N) Reviews:** แคมป์มีหลายรีวิว
- **Camp (1) → (N) Add-ons:** แคมป์มีหลาย add-ons
- **User (1) → (N) Bookings:** ผู้ใช้มีหลายการจอง
- **User (1) → (N) Favorites:** ผู้ใช้มีหลายรายการ favorites
- **User (1) → (N) Reviews:** ผู้ใช้เขียนหลายรีวิว
- **Booking (1) → (1) Payment:** การจองมีการชำระเงินหนึ่งรายการ

---

## 8. User Interface Requirements

### 8.1 Design System
ระบบออกแบบ UI:
- **Color Palette:** Primary Green (#2E7D32), Secondary colors
- **Typography:** DM Sans font family
- **Icons:** Lucide React icon set
- **Component Library:** Shadcn-UI (based on Radix UI)
- **Animation:** Framer Motion for smooth transitions

### 8.2 Page Layout Requirements

#### 8.2.1 Home Page (Index)
- Hero section with search bar
- Category pills for quick filtering
- Featured camps grid
- Trust badges and statistics
- Footer with links

#### 8.2.2 Camp Listing Page
- Search bar (sticky header)
- Active filter badges
- View toggle (Grid/List/Map)
- Camp cards with image carousel
- Pagination or infinite scroll
- Floating map button (mobile)

#### 8.2.3 Camp Detail Page
- Image gallery with lightbox
- Camp information section
- Accommodation options selection
- Booking form (date, guests, add-ons)
- Price calculator
- Weather forecast cards
- Reviews section
- Map location

#### 8.2.4 Authentication Page
- Email input form
- OTP input (6 digits)
- Timer countdown for resend
- Social login buttons

#### 8.2.5 Payment Page
- Booking summary
- Payment method tabs
- Card form with validation
- Bank transfer information
- Processing indicator

### 8.3 Responsive Breakpoints

| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| xs | < 640px | Small phones |
| sm | 640px - 767px | Large phones |
| md | 768px - 1023px | Tablets |
| lg | 1024px - 1279px | Small laptops |
| xl | 1280px - 1535px | Desktops |
| 2xl | ≥ 1536px | Large screens |

### 8.4 Navigation Flow
**Main Navigation:**
- Home → Camp List → Camp Detail → Booking → Payment → Confirmation
- Home → Gear Shop → Product Detail
- Any Page → Auth → Return to previous page
- Any Page → Favorites (logged in users)

### 8.5 Mobile-Specific UI
- Bottom navigation bar
- Drawer-based search and filters
- Swipe-able image carousel
- Pull-to-refresh
- Floating action buttons

---

## 9. Acceptance Criteria

### 9.1 Functional Acceptance Criteria

#### 9.1.1 Search Functionality

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| TC-SEARCH-001 | ค้นหาตามจังหวัด | แสดงแคมป์ในจังหวัดที่เลือกเท่านั้น | High |
| TC-SEARCH-002 | กรองตามราคา | แสดงแคมป์ในช่วงราคาที่กำหนด | High |
| TC-SEARCH-003 | ค้นหาแบบรวม | กรองทุกเกณฑ์พร้อมกันได้ | High |
| TC-SEARCH-004 | ไม่พบผลลัพธ์ | แสดง Empty State ที่เหมาะสม | Medium |

#### 9.1.2 Booking Functionality

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| TC-BOOK-001 | เลือกที่พักและวันที่ | แสดงราคารวมถูกต้อง | High |
| TC-BOOK-002 | เพิ่มแขกเกินจำนวน | คำนวณค่าใช้จ่ายเพิ่มถูกต้อง | High |
| TC-BOOK-003 | เลือก add-ons | คำนวณราคา add-ons ถูกต้อง | Medium |
| TC-BOOK-004 | ยืนยันการจอง | นำไปหน้าชำระเงินพร้อมข้อมูลครบ | High |

#### 9.1.3 Payment Functionality

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| TC-PAY-001 | ชำระด้วยบัตร | ประมวลผลและแสดงยืนยัน | High |
| TC-PAY-002 | บัตรไม่ถูกต้อง | แสดงข้อความ error ที่เหมาะสม | High |
| TC-PAY-003 | สร้าง Transaction ID | ได้รับ Transaction ID ที่ unique | High |
| TC-PAY-004 | แสดงหน้ายืนยัน | แสดงข้อมูลการจองครบถ้วน | High |

#### 9.1.4 Authentication Functionality

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| TC-AUTH-001 | กรอก email ถูกต้อง | ส่ง OTP และไปหน้ากรอก OTP | High |
| TC-AUTH-002 | กรอก email ผิดรูปแบบ | แสดงข้อความ validation error | High |
| TC-AUTH-003 | กรอก OTP ถูกต้อง | เข้าสู่ระบบสำเร็จ | High |
| TC-AUTH-004 | กรอก OTP ผิด | แสดงข้อความ error | High |
| TC-AUTH-005 | ขอ OTP ใหม่ | ส่ง OTP ใหม่หลัง 60 วินาที | Medium |

### 9.2 Non-Functional Acceptance Criteria

#### 9.2.1 Performance Criteria

| Test ID | Test Case | Acceptance Threshold |
|---------|-----------|---------------------|
| TC-PERF-001 | Page Load Time (Desktop) | < 3 seconds |
| TC-PERF-002 | Page Load Time (Mobile 3G) | < 5 seconds |
| TC-PERF-003 | Search Response | < 500ms |
| TC-PERF-004 | Lighthouse Score | > 80 for all metrics |

#### 9.2.2 Compatibility Criteria

| Test ID | Test Case | Acceptance Threshold |
|---------|-----------|---------------------|
| TC-COMP-001 | Chrome (latest) | ทำงานได้ 100% |
| TC-COMP-002 | Firefox (latest) | ทำงานได้ 100% |
| TC-COMP-003 | Safari (latest) | ทำงานได้ 100% |
| TC-COMP-004 | Mobile Safari iOS | ทำงานได้ 100% |
| TC-COMP-005 | Chrome Android | ทำงานได้ 100% |

#### 9.2.3 Usability Criteria

| Test ID | Test Case | Acceptance Threshold |
|---------|-----------|---------------------|
| TC-USA-001 | Task Completion Rate | > 90% สำหรับ main flows |
| TC-USA-002 | Error Rate | < 5% ต่อ session |
| TC-USA-003 | User Satisfaction | > 4.0/5.0 จากการสำรวจ |

### 9.3 Security Acceptance Criteria

| Test ID | Test Case | Acceptance Threshold |
|---------|-----------|---------------------|
| TC-SEC-001 | XSS Testing | ไม่มี vulnerabilities |
| TC-SEC-002 | HTTPS Enforcement | ทุก connections เป็น HTTPS |
| TC-SEC-003 | Input Validation | ป้องกัน injection attacks |
| TC-SEC-004 | API Key Security | ไม่ expose ใน client-side code |

---

*End of Document*
