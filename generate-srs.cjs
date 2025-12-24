const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  TableOfContents,
  PageBreak,
  NumberFormat,
  LevelFormat,
  convertInchesToTwip,
} = require("docx");
const fs = require("fs");

// Helper function to create styled heading
function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text: text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

// Helper function to create normal paragraph
function createParagraph(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        ...options,
      }),
    ],
    spacing: { after: 120 },
  });
}

// Helper function to create bullet point
function createBullet(text, level = 0) {
  return new Paragraph({
    text: text,
    bullet: { level: level },
    spacing: { after: 80 },
  });
}

// Helper function to create table
function createTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: header, bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "E8E8E8" },
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ text: cell })],
                })
            ),
          })
      ),
    ],
  });
}

// Create the SRS Document
const doc = new Document({
  title: "Software Requirements Specification - Campy",
  description: "SRS Document for Campy Camping Booking System",
  creator: "Campy Development Team",
  sections: [
    {
      properties: {},
      children: [
        // Title Page
        new Paragraph({
          children: [
            new TextRun({
              text: "Software Requirements Specification",
              bold: true,
              size: 56,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 3000, after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "(SRS)",
              bold: true,
              size: 48,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Campy - ระบบจองแคมป์ปิ้ง",
              bold: true,
              size: 44,
              color: "2E7D32",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Camping Booking Platform",
              size: 32,
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 1500 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Version 1.0", size: 28 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Date: ${new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 2000 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Prepared by:", size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Campy Development Team", size: 24, bold: true }),
          ],
          alignment: AlignmentType.CENTER,
        }),

        // Page Break
        new Paragraph({ children: [new PageBreak()] }),

        // Document Control
        createHeading("Document Control", HeadingLevel.HEADING_1),
        createTable(
          ["Version", "Date", "Author", "Description"],
          [
            ["1.0", new Date().toLocaleDateString("th-TH"), "Development Team", "Initial SRS Document"],
          ]
        ),
        new Paragraph({ spacing: { after: 400 } }),

        // Table of Contents Header
        createHeading("Table of Contents", HeadingLevel.HEADING_1),
        createParagraph("1. Introduction"),
        createParagraph("2. System Overview"),
        createParagraph("3. Functional Requirements"),
        createParagraph("4. Non-Functional Requirements"),
        createParagraph("5. System Constraints"),
        createParagraph("6. Use Cases"),
        createParagraph("7. Data Requirements"),
        createParagraph("8. User Interface Requirements"),
        createParagraph("9. Acceptance Criteria"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 1. INTRODUCTION =====
        createHeading("1. Introduction", HeadingLevel.HEADING_1),

        createHeading("1.1 Purpose", HeadingLevel.HEADING_2),
        createParagraph(
          "เอกสารนี้เป็น Software Requirements Specification (SRS) สำหรับระบบ Campy ซึ่งเป็นแพลตฟอร์มจองแคมป์ปิ้งออนไลน์ โดยมีวัตถุประสงค์เพื่อกำหนดความต้องการทั้งด้านฟังก์ชันและที่ไม่ใช่ฟังก์ชันของระบบ รวมถึงข้อจำกัดและเงื่อนไขต่างๆ ที่เกี่ยวข้อง"
        ),

        createHeading("1.2 Project Objectives", HeadingLevel.HEADING_2),
        createBullet("เป็นแพลตฟอร์มกลางในการค้นหาและจองสถานที่แคมป์ปิ้งทั่วประเทศไทย"),
        createBullet("อำนวยความสะดวกให้ผู้ใช้สามารถค้นหา เปรียบเทียบ และจองแคมป์ได้อย่างง่ายดาย"),
        createBullet("ให้ข้อมูลที่ครบถ้วนเกี่ยวกับสถานที่แคมป์ปิ้ง รวมถึงสิ่งอำนวยความสะดวก ราคา และรีวิว"),
        createBullet("รองรับการชำระเงินออนไลน์ที่ปลอดภัยและหลากหลายช่องทาง"),
        createBullet("ให้บริการร้านค้าอุปกรณ์แคมป์ปิ้ง (Gear Shop) เสริม"),

        createHeading("1.3 Scope", HeadingLevel.HEADING_2),
        createParagraph("ขอบเขตของระบบ Campy ประกอบด้วย:"),
        createBullet("ระบบค้นหาและกรองแคมป์ปิ้งตามเกณฑ์ต่างๆ"),
        createBullet("ระบบแสดงรายละเอียดแคมป์พร้อมรูปภาพ แผนที่ และข้อมูลสภาพอากาศ"),
        createBullet("ระบบจองที่พักและ Add-ons"),
        createBullet("ระบบชำระเงินออนไลน์"),
        createBullet("ระบบ Favorites/Wishlist"),
        createBullet("ระบบรีวิวและให้คะแนน"),
        createBullet("ร้านค้าอุปกรณ์แคมป์ปิ้ง"),
        createBullet("รองรับหลายภาษา (7 ภาษา)"),

        createHeading("1.4 Definitions and Acronyms", HeadingLevel.HEADING_2),
        createTable(
          ["Term", "Definition"],
          [
            ["Camp", "สถานที่แคมป์ปิ้งหรือที่พัก"],
            ["Accommodation", "ประเภทที่พัก เช่น เต็นท์, โดม, กระท่อม"],
            ["Add-ons", "บริการเสริมที่สามารถเพิ่มในการจอง"],
            ["OTP", "One-Time Password รหัสยืนยันตัวตนแบบใช้ครั้งเดียว"],
            ["SRS", "Software Requirements Specification"],
            ["UI", "User Interface"],
            ["UX", "User Experience"],
            ["API", "Application Programming Interface"],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 2. SYSTEM OVERVIEW =====
        createHeading("2. System Overview", HeadingLevel.HEADING_1),

        createHeading("2.1 System Description", HeadingLevel.HEADING_2),
        createParagraph(
          "Campy เป็นแพลตฟอร์มจองแคมป์ปิ้งออนไลน์ที่พัฒนาด้วย React และ TypeScript โดยเป็น Single Page Application (SPA) ที่มีส่วนติดต่อผู้ใช้ที่ทันสมัย รองรับการใช้งานทั้งบน Desktop และ Mobile ระบบมีแคมป์ปิ้ง 24 แห่ง กระจายใน 7 จังหวัดทั่วประเทศไทย"
        ),

        createHeading("2.2 Primary Users", HeadingLevel.HEADING_2),
        createTable(
          ["User Type", "Description", "Primary Activities"],
          [
            ["Guest User", "ผู้ใช้ทั่วไปที่ยังไม่ล็อกอิน", "ค้นหา, ดูรายละเอียดแคมป์, ดูอุปกรณ์"],
            ["Registered User", "ผู้ใช้ที่ล็อกอินแล้ว", "จอง, ชำระเงิน, บันทึก Favorites, เขียนรีวิว"],
            ["Admin", "ผู้ดูแลระบบ (Future)", "จัดการแคมป์, ดูรายงาน, จัดการผู้ใช้"],
          ]
        ),

        createHeading("2.3 Operating Environment", HeadingLevel.HEADING_2),
        createParagraph("ระบบรองรับการทำงานบน:"),
        createBullet("Web Browsers: Chrome, Firefox, Safari, Edge (เวอร์ชันล่าสุด)"),
        createBullet("Mobile Browsers: Safari iOS, Chrome Android"),
        createBullet("Screen Sizes: Desktop (1920px+), Tablet (768px-1024px), Mobile (320px-767px)"),

        createHeading("2.4 System Architecture", HeadingLevel.HEADING_2),
        createParagraph("Frontend Stack:"),
        createBullet("React 18.3.1 - UI Framework"),
        createBullet("TypeScript 5.8.3 - Type Safety"),
        createBullet("Vite 5.4.19 - Build Tool"),
        createBullet("Tailwind CSS 3.4.17 - Styling"),
        createBullet("Shadcn-UI - Component Library"),
        createBullet("TanStack React Query 5.83.0 - Data Fetching"),
        createBullet("React Router DOM 6.30.1 - Routing"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 3. FUNCTIONAL REQUIREMENTS =====
        createHeading("3. Functional Requirements", HeadingLevel.HEADING_1),

        createHeading("3.1 Authentication Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-AUTH-001", "Email Input", "ผู้ใช้สามารถกรอก email เพื่อเริ่มกระบวนการล็อกอิน", "High"],
            ["FR-AUTH-002", "OTP Generation", "ระบบสร้าง OTP 6 หลักและส่งไปยัง email ที่ระบุ", "High"],
            ["FR-AUTH-003", "OTP Verification", "ผู้ใช้กรอก OTP 6 หลักเพื่อยืนยันตัวตน", "High"],
            ["FR-AUTH-004", "OTP Resend", "ผู้ใช้สามารถขอส่ง OTP ใหม่หลังจาก 60 วินาที", "Medium"],
            ["FR-AUTH-005", "Social Login", "รองรับ Google, Facebook, Apple Sign-in (Future)", "Low"],
            ["FR-AUTH-006", "Logout", "ผู้ใช้สามารถออกจากระบบได้", "High"],
          ]
        ),

        createHeading("3.2 Search and Filter Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-SEARCH-001", "Location Search", "ค้นหาตามจังหวัด (7 จังหวัด)", "High"],
            ["FR-SEARCH-002", "Date Range", "เลือกวันเช็คอิน-เช็คเอาท์", "High"],
            ["FR-SEARCH-003", "Guest Count", "ระบุจำนวน ผู้ใหญ่/เด็ก/ทารก/สัตว์เลี้ยง", "High"],
            ["FR-SEARCH-004", "Price Filter", "กรองตามช่วงราคา ฿0 - ฿5,000", "High"],
            ["FR-SEARCH-005", "Facility Filter", "กรองตามสิ่งอำนวยความสะดวก", "Medium"],
            ["FR-SEARCH-006", "Rating Filter", "กรองตามคะแนนขั้นต่ำ", "Medium"],
            ["FR-SEARCH-007", "Category Filter", "กรองตามหมวดหมู่ (glamping, ใกล้กรุงเทพ, ฯลฯ)", "High"],
            ["FR-SEARCH-008", "Accommodation Type", "กรองตามประเภทที่พัก (tent, dome, cabin)", "Medium"],
            ["FR-SEARCH-009", "Search Persistence", "บันทึกการค้นหาล่าสุดใน localStorage", "Low"],
          ]
        ),

        createHeading("3.3 Camp Display Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-CAMP-001", "Camp Listing", "แสดงรายการแคมป์ในรูปแบบ Grid/List", "High"],
            ["FR-CAMP-002", "Map View", "แสดงแคมป์บนแผนที่ Mapbox", "High"],
            ["FR-CAMP-003", "Camp Detail Page", "แสดงรายละเอียดแคมป์ครบถ้วน", "High"],
            ["FR-CAMP-004", "Image Gallery", "แสดงรูปภาพแคมป์พร้อม Lightbox", "High"],
            ["FR-CAMP-005", "Weather Display", "แสดงพยากรณ์อากาศ 5 วัน", "Medium"],
            ["FR-CAMP-006", "Facility Icons", "แสดง icons สิ่งอำนวยความสะดวก", "Medium"],
            ["FR-CAMP-007", "Price Display", "แสดงราคาต่อคืนตามประเภทที่พัก", "High"],
          ]
        ),

        createHeading("3.4 Booking Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-BOOK-001", "Accommodation Selection", "เลือกประเภทที่พัก (tent/dome/cabin)", "High"],
            ["FR-BOOK-002", "Date Selection", "เลือกวันเข้าพัก-ออก", "High"],
            ["FR-BOOK-003", "Guest Count", "ระบุจำนวนแขก", "High"],
            ["FR-BOOK-004", "Extra Guest Charge", "คำนวณค่าใช้จ่ายแขกเพิ่มเติม", "Medium"],
            ["FR-BOOK-005", "Add-ons Selection", "เลือก add-ons (BBQ, อาหารเช้า, ฯลฯ)", "Medium"],
            ["FR-BOOK-006", "Price Calculation", "คำนวณราคารวมทั้งหมด", "High"],
            ["FR-BOOK-007", "Booking Summary", "แสดงสรุปการจองก่อนชำระเงิน", "High"],
          ]
        ),

        createHeading("3.5 Payment Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-PAY-001", "Credit Card Payment", "ชำระเงินด้วยบัตรเครดิต/เดบิต", "High"],
            ["FR-PAY-002", "Bank Transfer", "ชำระเงินผ่านการโอนเงิน", "High"],
            ["FR-PAY-003", "Mobile Wallet", "ชำระเงินผ่าน PromptPay, LINE Pay", "High"],
            ["FR-PAY-004", "Card Validation", "ตรวจสอบข้อมูลบัตรก่อนชำระ", "High"],
            ["FR-PAY-005", "Transaction ID", "สร้างหมายเลขธุรกรรม", "High"],
            ["FR-PAY-006", "Payment Confirmation", "แสดงหน้ายืนยันการชำระเงิน", "High"],
          ]
        ),

        createHeading("3.6 Favorites Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-FAV-001", "Add to Favorites", "กดหัวใจเพื่อบันทึกแคมป์ที่ชอบ", "Medium"],
            ["FR-FAV-002", "Remove from Favorites", "ลบแคมป์ออกจาก Favorites", "Medium"],
            ["FR-FAV-003", "Favorites Page", "แสดงรายการแคมป์ที่บันทึกไว้", "Medium"],
            ["FR-FAV-004", "Persistence", "บันทึก Favorites ใน localStorage", "Medium"],
          ]
        ),

        createHeading("3.7 Review Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-REV-001", "View Reviews", "แสดงรีวิวของแคมป์", "High"],
            ["FR-REV-002", "Submit Review", "เขียนรีวิวและให้คะแนน 1-5 ดาว", "Medium"],
            ["FR-REV-003", "Helpful Vote", "กด helpful บนรีวิวที่เป็นประโยชน์", "Low"],
            ["FR-REV-004", "Review Persistence", "บันทึกรีวิวใหม่ใน localStorage", "Medium"],
          ]
        ),

        createHeading("3.8 Gear Shop Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-GEAR-001", "Product Listing", "แสดงรายการอุปกรณ์แคมป์ปิ้ง 17 รายการ", "Medium"],
            ["FR-GEAR-002", "Category Filter", "กรองตามหมวดหมู่ (เฟอร์นิเจอร์, ไฟ, ฯลฯ)", "Medium"],
            ["FR-GEAR-003", "Price Range", "กรองตามช่วงราคา", "Low"],
            ["FR-GEAR-004", "Product Detail", "แสดงรายละเอียดสินค้า", "Medium"],
          ]
        ),

        createHeading("3.9 Internationalization Module", HeadingLevel.HEADING_2),

        createTable(
          ["Req ID", "Requirement", "Description", "Priority"],
          [
            ["FR-I18N-001", "Multi-language Support", "รองรับ 7 ภาษา (TH, EN, ZH, KO, JA, DE, FR)", "Medium"],
            ["FR-I18N-002", "Auto Detection", "ตรวจจับภาษาจาก Browser", "Low"],
            ["FR-I18N-003", "Language Preference", "บันทึกการเลือกภาษาของผู้ใช้", "Low"],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 4. NON-FUNCTIONAL REQUIREMENTS =====
        createHeading("4. Non-Functional Requirements", HeadingLevel.HEADING_1),

        createHeading("4.1 Performance Requirements", HeadingLevel.HEADING_2),

        createTable(
          ["NFR ID", "Requirement", "Target Value"],
          [
            ["NFR-PERF-001", "Initial Page Load Time", "< 3 seconds (Desktop), < 5 seconds (Mobile 3G)"],
            ["NFR-PERF-002", "Time to Interactive (TTI)", "< 4 seconds"],
            ["NFR-PERF-003", "Search Response Time", "< 500ms"],
            ["NFR-PERF-004", "Image Load Time", "< 2 seconds per image"],
            ["NFR-PERF-005", "Concurrent Users", "รองรับ 1,000 users พร้อมกัน"],
            ["NFR-PERF-006", "API Response Time", "< 1 second (Weather API)"],
          ]
        ),

        createHeading("4.2 Security Requirements", HeadingLevel.HEADING_2),

        createTable(
          ["NFR ID", "Requirement", "Description"],
          [
            ["NFR-SEC-001", "Authentication", "OTP-based email verification"],
            ["NFR-SEC-002", "Data Encryption", "HTTPS/TLS สำหรับทุก connections"],
            ["NFR-SEC-003", "Input Validation", "ตรวจสอบข้อมูล input ทุกช่อง"],
            ["NFR-SEC-004", "XSS Prevention", "ป้องกัน Cross-Site Scripting"],
            ["NFR-SEC-005", "CSRF Protection", "ป้องกัน Cross-Site Request Forgery"],
            ["NFR-SEC-006", "Payment Security", "PCI DSS compliance สำหรับการชำระเงิน"],
            ["NFR-SEC-007", "API Key Protection", "เก็บ API keys ใน environment variables"],
          ]
        ),

        createHeading("4.3 Usability Requirements", HeadingLevel.HEADING_2),

        createTable(
          ["NFR ID", "Requirement", "Description"],
          [
            ["NFR-USA-001", "Responsive Design", "รองรับทุกขนาดหน้าจอ (320px - 4K)"],
            ["NFR-USA-002", "Mobile First", "ออกแบบเน้น Mobile experience"],
            ["NFR-USA-003", "Intuitive Navigation", "Navigation ที่ใช้งานง่าย"],
            ["NFR-USA-004", "Loading States", "แสดง Skeleton loading ขณะโหลด"],
            ["NFR-USA-005", "Error Handling", "แสดงข้อความ error ที่เข้าใจง่าย"],
            ["NFR-USA-006", "Accessibility", "รองรับ WCAG 2.1 Level AA"],
          ]
        ),

        createHeading("4.4 Reliability Requirements", HeadingLevel.HEADING_2),

        createTable(
          ["NFR ID", "Requirement", "Target Value"],
          [
            ["NFR-REL-001", "System Availability", "99.9% uptime"],
            ["NFR-REL-002", "Data Persistence", "ไม่สูญหายข้อมูลการจอง"],
            ["NFR-REL-003", "Error Recovery", "ระบบกู้คืนได้ภายใน 5 นาที"],
            ["NFR-REL-004", "Backup Frequency", "Daily backup"],
          ]
        ),

        createHeading("4.5 Scalability Requirements", HeadingLevel.HEADING_2),

        createTable(
          ["NFR ID", "Requirement", "Description"],
          [
            ["NFR-SCA-001", "Horizontal Scaling", "รองรับการเพิ่ม server instances"],
            ["NFR-SCA-002", "Database Scaling", "รองรับการขยาย database"],
            ["NFR-SCA-003", "CDN Support", "รองรับ Content Delivery Network"],
            ["NFR-SCA-004", "Caching Strategy", "มี caching layer สำหรับ static content"],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 5. SYSTEM CONSTRAINTS =====
        createHeading("5. System Constraints", HeadingLevel.HEADING_1),

        createHeading("5.1 Technical Constraints", HeadingLevel.HEADING_2),
        createBullet("Platform: Web-based application (SPA)"),
        createBullet("Browser Support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+"),
        createBullet("JavaScript Required: ต้องเปิด JavaScript"),
        createBullet("Internet Connection: ต้องมีการเชื่อมต่ออินเทอร์เน็ต"),

        createHeading("5.2 Technology Stack Constraints", HeadingLevel.HEADING_2),
        createTable(
          ["Layer", "Technology", "Version"],
          [
            ["Frontend Framework", "React", "18.3.1"],
            ["Language", "TypeScript", "5.8.3"],
            ["Build Tool", "Vite", "5.4.19"],
            ["Styling", "Tailwind CSS", "3.4.17"],
            ["UI Components", "Shadcn-UI (Radix)", "Latest"],
            ["State Management", "React Query", "5.83.0"],
            ["Routing", "React Router", "6.30.1"],
            ["Form Handling", "React Hook Form", "7.61.1"],
            ["Validation", "Zod", "3.25.76"],
            ["i18n", "i18next", "25.7.3"],
            ["Maps", "Mapbox GL", "3.17.0"],
            ["Date Handling", "date-fns", "3.6.0"],
          ]
        ),

        createHeading("5.3 Third-Party Integrations", HeadingLevel.HEADING_2),
        createTable(
          ["Service", "Purpose", "Status"],
          [
            ["OpenWeatherMap API", "Weather forecast data", "Integrated"],
            ["Mapbox GL", "Interactive maps", "Integrated"],
            ["Stripe/Payment Gateway", "Payment processing", "Ready to integrate"],
            ["Google OAuth", "Social login", "Ready to integrate"],
            ["Facebook OAuth", "Social login", "Ready to integrate"],
            ["Apple Sign-in", "Social login", "Ready to integrate"],
          ]
        ),

        createHeading("5.4 Legal and Compliance Constraints", HeadingLevel.HEADING_2),
        createBullet("PDPA: ปฏิบัติตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล"),
        createBullet("Terms of Service: ต้องมีเงื่อนไขการใช้บริการ"),
        createBullet("Privacy Policy: ต้องมีนโยบายความเป็นส่วนตัว"),
        createBullet("Payment Regulations: ปฏิบัติตามกฎหมายธุรกรรมอิเล็กทรอนิกส์"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 6. USE CASES =====
        createHeading("6. Use Cases", HeadingLevel.HEADING_1),

        createHeading("6.1 UC-001: Search for Camps", HeadingLevel.HEADING_2),
        createTable(
          ["Element", "Description"],
          [
            ["Use Case ID", "UC-001"],
            ["Name", "Search for Camps"],
            ["Actors", "Guest User, Registered User"],
            ["Description", "ผู้ใช้ค้นหาแคมป์ตามเกณฑ์ที่กำหนด"],
            ["Preconditions", "ผู้ใช้อยู่ในหน้าแรกหรือหน้ารายการแคมป์"],
            ["Main Flow", "1. ผู้ใช้เลือกจังหวัด\n2. ผู้ใช้เลือกวันที่เข้าพัก-ออก\n3. ผู้ใช้ระบุจำนวนแขก\n4. ผู้ใช้กดค้นหา\n5. ระบบแสดงผลลัพธ์"],
            ["Alternative Flow", "A1: ใช้ตัวกรองเพิ่มเติม (ราคา, สิ่งอำนวยความสะดวก)"],
            ["Postconditions", "แสดงรายการแคมป์ที่ตรงตามเกณฑ์"],
          ]
        ),

        createHeading("6.2 UC-002: View Camp Details", HeadingLevel.HEADING_2),
        createTable(
          ["Element", "Description"],
          [
            ["Use Case ID", "UC-002"],
            ["Name", "View Camp Details"],
            ["Actors", "Guest User, Registered User"],
            ["Description", "ผู้ใช้ดูรายละเอียดของแคมป์"],
            ["Preconditions", "มีรายการแคมป์แสดงอยู่"],
            ["Main Flow", "1. ผู้ใช้คลิกที่แคมป์\n2. ระบบแสดงหน้ารายละเอียด\n3. ผู้ใช้ดูรูปภาพ, ข้อมูล, รีวิว\n4. ผู้ใช้ดูพยากรณ์อากาศ"],
            ["Alternative Flow", "A1: ผู้ใช้เปิด Lightbox ดูรูปเต็ม\nA2: ผู้ใช้ดูตำแหน่งบนแผนที่"],
            ["Postconditions", "ผู้ใช้ได้รับข้อมูลครบถ้วนของแคมป์"],
          ]
        ),

        createHeading("6.3 UC-003: Make a Booking", HeadingLevel.HEADING_2),
        createTable(
          ["Element", "Description"],
          [
            ["Use Case ID", "UC-003"],
            ["Name", "Make a Booking"],
            ["Actors", "Registered User"],
            ["Description", "ผู้ใช้ทำการจองแคมป์"],
            ["Preconditions", "ผู้ใช้ล็อกอินแล้ว, อยู่ในหน้ารายละเอียดแคมป์"],
            ["Main Flow", "1. เลือกประเภทที่พัก\n2. เลือกวันเข้าพัก-ออก\n3. ระบุจำนวนแขก\n4. เลือก add-ons (optional)\n5. ตรวจสอบสรุปการจอง\n6. กดจอง"],
            ["Alternative Flow", "A1: เพิ่มแขกเกินจำนวนมาตรฐาน (มีค่าใช้จ่ายเพิ่ม)"],
            ["Postconditions", "สร้างรายการจองและนำไปหน้าชำระเงิน"],
          ]
        ),

        createHeading("6.4 UC-004: Process Payment", HeadingLevel.HEADING_2),
        createTable(
          ["Element", "Description"],
          [
            ["Use Case ID", "UC-004"],
            ["Name", "Process Payment"],
            ["Actors", "Registered User"],
            ["Description", "ผู้ใช้ชำระเงินค่าจอง"],
            ["Preconditions", "มีรายการจองที่รอชำระเงิน"],
            ["Main Flow", "1. เลือกวิธีชำระเงิน\n2. กรอกข้อมูลการชำระ\n3. ยืนยันการชำระเงิน\n4. รอประมวลผล\n5. รับหน้ายืนยัน"],
            ["Alternative Flow", "A1: ชำระด้วยบัตรเครดิต\nA2: ชำระผ่านโอนเงิน\nA3: ชำระผ่าน PromptPay"],
            ["Postconditions", "การจองสำเร็จ, ได้รับ Transaction ID"],
          ]
        ),

        createHeading("6.5 UC-005: User Authentication", HeadingLevel.HEADING_2),
        createTable(
          ["Element", "Description"],
          [
            ["Use Case ID", "UC-005"],
            ["Name", "User Authentication (OTP)"],
            ["Actors", "Guest User"],
            ["Description", "ผู้ใช้เข้าสู่ระบบด้วย Email OTP"],
            ["Preconditions", "ผู้ใช้มี email ที่ใช้งานได้"],
            ["Main Flow", "1. กรอก email\n2. กดส่ง OTP\n3. รับ OTP ทาง email\n4. กรอก OTP 6 หลัก\n5. ยืนยัน"],
            ["Alternative Flow", "A1: ขอส่ง OTP ใหม่หลัง 60 วินาที\nA2: ใช้ Social Login"],
            ["Postconditions", "ผู้ใช้เข้าสู่ระบบสำเร็จ"],
          ]
        ),

        createHeading("6.6 UC-006: Manage Favorites", HeadingLevel.HEADING_2),
        createTable(
          ["Element", "Description"],
          [
            ["Use Case ID", "UC-006"],
            ["Name", "Manage Favorites"],
            ["Actors", "Registered User"],
            ["Description", "ผู้ใช้จัดการรายการแคมป์ที่ชื่นชอบ"],
            ["Preconditions", "ผู้ใช้ล็อกอินแล้ว"],
            ["Main Flow", "1. กดไอคอนหัวใจบนแคมป์\n2. แคมป์ถูกเพิ่มเข้า Favorites\n3. ดู Favorites ในหน้าที่กำหนด"],
            ["Alternative Flow", "A1: ลบแคมป์ออกจาก Favorites"],
            ["Postconditions", "รายการ Favorites ถูกอัพเดท"],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 7. DATA REQUIREMENTS =====
        createHeading("7. Data Requirements", HeadingLevel.HEADING_1),

        createHeading("7.1 Camp Data Model", HeadingLevel.HEADING_2),
        createTable(
          ["Field", "Type", "Description", "Required"],
          [
            ["id", "number", "รหัสแคมป์", "Yes"],
            ["name", "string", "ชื่อแคมป์ (ภาษาไทย)", "Yes"],
            ["nameEn", "string", "ชื่อแคมป์ (ภาษาอังกฤษ)", "Yes"],
            ["location", "string", "ตำแหน่ง/พื้นที่", "Yes"],
            ["province", "string", "จังหวัด", "Yes"],
            ["description", "string", "คำอธิบายแคมป์", "Yes"],
            ["images", "string[]", "URLs รูปภาพ", "Yes"],
            ["rating", "number", "คะแนนรีวิว (1-5)", "Yes"],
            ["reviewCount", "number", "จำนวนรีวิว", "Yes"],
            ["pricePerNight", "number", "ราคาเริ่มต้นต่อคืน", "Yes"],
            ["accommodationType", "enum", "tent | dome | cabin", "Yes"],
            ["highlights", "string[]", "จุดเด่น", "Yes"],
            ["facilities", "string[]", "สิ่งอำนวยความสะดวก", "Yes"],
            ["maxGuests", "number", "จำนวนแขกสูงสุด", "Yes"],
            ["coordinates", "object", "lat, lng", "Yes"],
            ["isBeginner", "boolean", "เหมาะกับมือใหม่", "No"],
            ["isPopular", "boolean", "ยอดนิยม", "No"],
            ["distanceFromBangkok", "string", "ระยะทางจากกรุงเทพ", "No"],
          ]
        ),

        createHeading("7.2 Accommodation Option Data Model", HeadingLevel.HEADING_2),
        createTable(
          ["Field", "Type", "Description", "Required"],
          [
            ["type", "string", "ประเภทที่พัก", "Yes"],
            ["name", "string", "ชื่อที่พัก", "Yes"],
            ["pricePerNight", "number", "ราคาต่อคืน", "Yes"],
            ["maxGuests", "number", "จำนวนแขกมาตรฐาน", "Yes"],
            ["extraAdultPrice", "number", "ค่าผู้ใหญ่เพิ่ม", "Yes"],
            ["extraChildPrice", "number", "ค่าเด็กเพิ่ม", "Yes"],
            ["amenities", "string[]", "สิ่งอำนวยความสะดวก", "Yes"],
            ["availability", "boolean", "พร้อมจอง", "Yes"],
          ]
        ),

        createHeading("7.3 Booking Data Model", HeadingLevel.HEADING_2),
        createTable(
          ["Field", "Type", "Description", "Required"],
          [
            ["bookingId", "string", "รหัสการจอง", "Yes"],
            ["campId", "number", "รหัสแคมป์", "Yes"],
            ["userId", "string", "รหัสผู้ใช้", "Yes"],
            ["accommodationId", "string", "รหัสที่พัก", "Yes"],
            ["checkIn", "Date", "วันเช็คอิน", "Yes"],
            ["checkOut", "Date", "วันเช็คเอาท์", "Yes"],
            ["adults", "number", "จำนวนผู้ใหญ่", "Yes"],
            ["children", "number", "จำนวนเด็ก", "Yes"],
            ["selectedAddons", "string[]", "add-ons ที่เลือก", "No"],
            ["totalPrice", "number", "ราคารวม", "Yes"],
            ["status", "enum", "pending | confirmed | cancelled", "Yes"],
            ["transactionId", "string", "รหัสธุรกรรม", "Yes"],
            ["createdAt", "Date", "วันที่สร้าง", "Yes"],
          ]
        ),

        createHeading("7.4 Gear Data Model", HeadingLevel.HEADING_2),
        createTable(
          ["Field", "Type", "Description", "Required"],
          [
            ["id", "number", "รหัสสินค้า", "Yes"],
            ["name", "string", "ชื่อสินค้า (ไทย)", "Yes"],
            ["nameEn", "string", "ชื่อสินค้า (อังกฤษ)", "Yes"],
            ["category", "string", "หมวดหมู่", "Yes"],
            ["price", "number", "ราคา", "Yes"],
            ["originalPrice", "number", "ราคาเดิม", "No"],
            ["images", "string[]", "รูปสินค้า", "Yes"],
            ["rating", "number", "คะแนน", "Yes"],
            ["features", "string[]", "คุณสมบัติ", "Yes"],
          ]
        ),

        createHeading("7.5 Data Relationships", HeadingLevel.HEADING_2),
        createParagraph("ความสัมพันธ์ระหว่างข้อมูล:"),
        createBullet("Camp (1) → (N) Accommodation Options: แคมป์มีหลายตัวเลือกที่พัก"),
        createBullet("Camp (1) → (N) Reviews: แคมป์มีหลายรีวิว"),
        createBullet("Camp (1) → (N) Add-ons: แคมป์มีหลาย add-ons"),
        createBullet("User (1) → (N) Bookings: ผู้ใช้มีหลายการจอง"),
        createBullet("User (1) → (N) Favorites: ผู้ใช้มีหลายรายการ favorites"),
        createBullet("User (1) → (N) Reviews: ผู้ใช้เขียนหลายรีวิว"),
        createBullet("Booking (1) → (1) Payment: การจองมีการชำระเงินหนึ่งรายการ"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 8. USER INTERFACE REQUIREMENTS =====
        createHeading("8. User Interface Requirements", HeadingLevel.HEADING_1),

        createHeading("8.1 Design System", HeadingLevel.HEADING_2),
        createParagraph("ระบบออกแบบ UI:"),
        createBullet("Color Palette: Primary Green (#2E7D32), Secondary colors"),
        createBullet("Typography: DM Sans font family"),
        createBullet("Icons: Lucide React icon set"),
        createBullet("Component Library: Shadcn-UI (based on Radix UI)"),
        createBullet("Animation: Framer Motion for smooth transitions"),

        createHeading("8.2 Page Layout Requirements", HeadingLevel.HEADING_2),

        createHeading("8.2.1 Home Page (Index)", HeadingLevel.HEADING_3),
        createBullet("Hero section with search bar"),
        createBullet("Category pills for quick filtering"),
        createBullet("Featured camps grid"),
        createBullet("Trust badges and statistics"),
        createBullet("Footer with links"),

        createHeading("8.2.2 Camp Listing Page", HeadingLevel.HEADING_3),
        createBullet("Search bar (sticky header)"),
        createBullet("Active filter badges"),
        createBullet("View toggle (Grid/List/Map)"),
        createBullet("Camp cards with image carousel"),
        createBullet("Pagination or infinite scroll"),
        createBullet("Floating map button (mobile)"),

        createHeading("8.2.3 Camp Detail Page", HeadingLevel.HEADING_3),
        createBullet("Image gallery with lightbox"),
        createBullet("Camp information section"),
        createBullet("Accommodation options selection"),
        createBullet("Booking form (date, guests, add-ons)"),
        createBullet("Price calculator"),
        createBullet("Weather forecast cards"),
        createBullet("Reviews section"),
        createBullet("Map location"),

        createHeading("8.2.4 Authentication Page", HeadingLevel.HEADING_3),
        createBullet("Email input form"),
        createBullet("OTP input (6 digits)"),
        createBullet("Timer countdown for resend"),
        createBullet("Social login buttons"),

        createHeading("8.2.5 Payment Page", HeadingLevel.HEADING_3),
        createBullet("Booking summary"),
        createBullet("Payment method tabs"),
        createBullet("Card form with validation"),
        createBullet("Bank transfer information"),
        createBullet("Processing indicator"),

        createHeading("8.3 Responsive Breakpoints", HeadingLevel.HEADING_2),
        createTable(
          ["Breakpoint", "Width", "Target Device"],
          [
            ["xs", "< 640px", "Small phones"],
            ["sm", "640px - 767px", "Large phones"],
            ["md", "768px - 1023px", "Tablets"],
            ["lg", "1024px - 1279px", "Small laptops"],
            ["xl", "1280px - 1535px", "Desktops"],
            ["2xl", "≥ 1536px", "Large screens"],
          ]
        ),

        createHeading("8.4 Navigation Flow", HeadingLevel.HEADING_2),
        createParagraph("Main Navigation:"),
        createBullet("Home → Camp List → Camp Detail → Booking → Payment → Confirmation"),
        createBullet("Home → Gear Shop → Product Detail"),
        createBullet("Any Page → Auth → Return to previous page"),
        createBullet("Any Page → Favorites (logged in users)"),

        createHeading("8.5 Mobile-Specific UI", HeadingLevel.HEADING_2),
        createBullet("Bottom navigation bar"),
        createBullet("Drawer-based search and filters"),
        createBullet("Swipe-able image carousel"),
        createBullet("Pull-to-refresh"),
        createBullet("Floating action buttons"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 9. ACCEPTANCE CRITERIA =====
        createHeading("9. Acceptance Criteria", HeadingLevel.HEADING_1),

        createHeading("9.1 Functional Acceptance Criteria", HeadingLevel.HEADING_2),

        createHeading("9.1.1 Search Functionality", HeadingLevel.HEADING_3),
        createTable(
          ["Test ID", "Test Case", "Expected Result", "Priority"],
          [
            ["TC-SEARCH-001", "ค้นหาตามจังหวัด", "แสดงแคมป์ในจังหวัดที่เลือกเท่านั้น", "High"],
            ["TC-SEARCH-002", "กรองตามราคา", "แสดงแคมป์ในช่วงราคาที่กำหนด", "High"],
            ["TC-SEARCH-003", "ค้นหาแบบรวม", "กรองทุกเกณฑ์พร้อมกันได้", "High"],
            ["TC-SEARCH-004", "ไม่พบผลลัพธ์", "แสดง Empty State ที่เหมาะสม", "Medium"],
          ]
        ),

        createHeading("9.1.2 Booking Functionality", HeadingLevel.HEADING_3),
        createTable(
          ["Test ID", "Test Case", "Expected Result", "Priority"],
          [
            ["TC-BOOK-001", "เลือกที่พักและวันที่", "แสดงราคารวมถูกต้อง", "High"],
            ["TC-BOOK-002", "เพิ่มแขกเกินจำนวน", "คำนวณค่าใช้จ่ายเพิ่มถูกต้อง", "High"],
            ["TC-BOOK-003", "เลือก add-ons", "คำนวณราคา add-ons ถูกต้อง", "Medium"],
            ["TC-BOOK-004", "ยืนยันการจอง", "นำไปหน้าชำระเงินพร้อมข้อมูลครบ", "High"],
          ]
        ),

        createHeading("9.1.3 Payment Functionality", HeadingLevel.HEADING_3),
        createTable(
          ["Test ID", "Test Case", "Expected Result", "Priority"],
          [
            ["TC-PAY-001", "ชำระด้วยบัตร", "ประมวลผลและแสดงยืนยัน", "High"],
            ["TC-PAY-002", "บัตรไม่ถูกต้อง", "แสดงข้อความ error ที่เหมาะสม", "High"],
            ["TC-PAY-003", "สร้าง Transaction ID", "ได้รับ Transaction ID ที่ unique", "High"],
            ["TC-PAY-004", "แสดงหน้ายืนยัน", "แสดงข้อมูลการจองครบถ้วน", "High"],
          ]
        ),

        createHeading("9.1.4 Authentication Functionality", HeadingLevel.HEADING_3),
        createTable(
          ["Test ID", "Test Case", "Expected Result", "Priority"],
          [
            ["TC-AUTH-001", "กรอก email ถูกต้อง", "ส่ง OTP และไปหน้ากรอก OTP", "High"],
            ["TC-AUTH-002", "กรอก email ผิดรูปแบบ", "แสดงข้อความ validation error", "High"],
            ["TC-AUTH-003", "กรอก OTP ถูกต้อง", "เข้าสู่ระบบสำเร็จ", "High"],
            ["TC-AUTH-004", "กรอก OTP ผิด", "แสดงข้อความ error", "High"],
            ["TC-AUTH-005", "ขอ OTP ใหม่", "ส่ง OTP ใหม่หลัง 60 วินาที", "Medium"],
          ]
        ),

        createHeading("9.2 Non-Functional Acceptance Criteria", HeadingLevel.HEADING_2),

        createHeading("9.2.1 Performance Criteria", HeadingLevel.HEADING_3),
        createTable(
          ["Test ID", "Test Case", "Acceptance Threshold"],
          [
            ["TC-PERF-001", "Page Load Time (Desktop)", "< 3 seconds"],
            ["TC-PERF-002", "Page Load Time (Mobile 3G)", "< 5 seconds"],
            ["TC-PERF-003", "Search Response", "< 500ms"],
            ["TC-PERF-004", "Lighthouse Score", "> 80 for all metrics"],
          ]
        ),

        createHeading("9.2.2 Compatibility Criteria", HeadingLevel.HEADING_3),
        createTable(
          ["Test ID", "Test Case", "Acceptance Threshold"],
          [
            ["TC-COMP-001", "Chrome (latest)", "ทำงานได้ 100%"],
            ["TC-COMP-002", "Firefox (latest)", "ทำงานได้ 100%"],
            ["TC-COMP-003", "Safari (latest)", "ทำงานได้ 100%"],
            ["TC-COMP-004", "Mobile Safari iOS", "ทำงานได้ 100%"],
            ["TC-COMP-005", "Chrome Android", "ทำงานได้ 100%"],
          ]
        ),

        createHeading("9.2.3 Usability Criteria", HeadingLevel.HEADING_3),
        createTable(
          ["Test ID", "Test Case", "Acceptance Threshold"],
          [
            ["TC-USA-001", "Task Completion Rate", "> 90% สำหรับ main flows"],
            ["TC-USA-002", "Error Rate", "< 5% ต่อ session"],
            ["TC-USA-003", "User Satisfaction", "> 4.0/5.0 จากการสำรวจ"],
          ]
        ),

        createHeading("9.3 Security Acceptance Criteria", HeadingLevel.HEADING_2),
        createTable(
          ["Test ID", "Test Case", "Acceptance Threshold"],
          [
            ["TC-SEC-001", "XSS Testing", "ไม่มี vulnerabilities"],
            ["TC-SEC-002", "HTTPS Enforcement", "ทุก connections เป็น HTTPS"],
            ["TC-SEC-003", "Input Validation", "ป้องกัน injection attacks"],
            ["TC-SEC-004", "API Key Security", "ไม่ expose ใน client-side code"],
          ]
        ),

        new Paragraph({ spacing: { after: 600 } }),

        // Document Footer
        new Paragraph({
          children: [
            new TextRun({
              text: "--- End of Document ---",
              italics: true,
              color: "888888",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    },
  ],
});

// Generate the document
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Campy_SRS_Document.docx", buffer);
  console.log("SRS Document created successfully: Campy_SRS_Document.docx");
});
