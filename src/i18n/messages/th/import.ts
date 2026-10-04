const importNs = {
  loading: "กำลังเตรียมการนำเข้าการ์ด…",
  page: {
    metaTitle: "นำเข้าการ์ด — Knowledge",
    home: "หน้าแรก",
    breadcrumb: "นำเข้าจากไฟล์",
    title: "นำเข้าการ์ดไปยัง: {title}",
  },
  steps: { label: "ขั้นตอนการนำเข้า", source: "เลือกแหล่งข้อมูล", preview: "ดูตัวอย่างและบันทึก" },
  tabs: { label: "แหล่งข้อมูล", file: "อัปโหลดไฟล์", paste: "วางข้อความ" },
  format: { label: "รูปแบบ", csv: "CSV (คั่นด้วย , ; หรือ Tab)", markdown: "Markdown" },
  content: {
    label: "เนื้อหา",
    placeholderCsv: "question,answer,explanation\nWhat is a closure?,A function that remembers its scope,Example: counter",
    placeholderMarkdown: "Q: What is a closure?\nA: A function that remembers its scope\nE: Example: counter",
  },
  actions: { preview: "ดูตัวอย่าง", back: "กลับ", cancel: "ยกเลิก" },
  templates: { title: "ดาวน์โหลดไฟล์ตัวอย่าง", csv: "ตัวอย่าง CSV", excel: "ตัวอย่าง Excel", markdown: "ตัวอย่าง Markdown" },
  guide: {
    title: "คู่มือรูปแบบไฟล์",
    csv: "CSV / Excel: แถวแรกคือหัวตาราง (question, answer, explanation) หากไม่มีหัวตาราง คอลัมน์ 1 = คำถาม คอลัมน์ 2 = คำตอบ คอลัมน์ 3 = คำอธิบาย",
    heading: "หัวข้อ Markdown: ## คำถาม ข้อความด้านล่างคือคำตอบ บรรทัดที่ขึ้นต้นด้วย > หรือส่วนหลัง --- คือคำอธิบาย",
    qa: "Markdown แบบ Q/A: ใช้ Q:/A:/E: (หรือ Question:/Answer:/Explanation:) โดยคั่นแต่ละการ์ดด้วยบรรทัดว่าง",
    table: "ตาราง Markdown: | question | answer | explanation |",
    english:
      "ภาษาอังกฤษ (ไม่บังคับ): เพิ่มคอลัมน์ phonetic/IPA และ partOfSpeech/pos ใน Markdown แบบ Q/A ใช้ P: สำหรับสัทอักษร การ์ดที่ไม่มีสัทอักษรจะถูกค้นหาให้อัตโนมัติหลังบันทึก (ต้องใช้อินเทอร์เน็ต)",
    max: "นำเข้าได้สูงสุด {max} การ์ดต่อครั้ง",
  },
  mode: {
    title: "วิธีบันทึก",
    append: "เพิ่มต่อท้าย",
    appendHint: "เก็บการ์ดเดิมไว้และเพิ่มการ์ดใหม่ต่อท้าย",
    replace: "แทนที่ทั้งหมด",
    replaceHint: "ลบการ์ดเดิมทั้งหมดแล้วแทนที่ด้วยการ์ดเหล่านี้",
    replaceWarning: "คำเตือน: การ์ดเดิมทั้งหมดในชุดนี้จะถูกลบถาวร",
  },
  errors: {
    tooMany: "นำเข้าได้สูงสุด {max} การ์ดต่อครั้ง (ตอนนี้มี {count}) โปรดลบบางส่วนหรือแบ่งไฟล์",
    invalid: {
      other: "มี {count} การ์ดที่ไม่มีคำถามหรือคำตอบ โปรดกรอกให้ครบหรือลบทิ้ง",
    },
  },
  parse: {
    noCards: "ไม่สามารถอ่านการ์ดได้ {row}{message}",
    rowPrefix: "แถวที่ {row}: ",
    empty: "ไม่พบการ์ดในข้อมูล",
    pickFile: "โปรดเลือกไฟล์ก่อน",
    pasteContent: "โปรดวางเนื้อหาที่ต้องการนำเข้า",
    failed: "ไม่สามารถอ่านข้อมูลได้",
    unsupportedFormat: 'ไม่รองรับไฟล์รูปแบบ "{format}" โปรดใช้ .csv, .xlsx, .xls, .md, .markdown หรือ .txt',
  },
  parseErrors: {
    missingQuestion: "ไม่มีคำถาม",
    missingAnswer: "ไม่มีคำตอบ",
    missingBoth: "ไม่มีทั้งคำถามและคำตอบ",
    missingAnswerFor: 'ไม่มีคำตอบสำหรับ "{text}"',
    csvFormat: "รูปแบบ CSV ผิดพลาด: {text}",
    noSheet: "ไฟล์ Excel ไม่มีชีต",
    orphanLine: "บรรทัดนี้อยู่นอกการ์ด (ต้องขึ้นต้นด้วย Q: / Question:)",
    unknownMarkdown: "ไม่รู้จักรูปแบบ Markdown (ใช้หัวข้อ Q:/A: หรือตาราง)",
  },
  save: {
    lookingUp: "กำลังค้นหาสัทอักษร…",
    lookingUpProgress: "กำลังค้นหาสัทอักษร {done}/{total}",
    lookupInterrupted:
      "บันทึกการ์ดแล้ว แต่ค้นหาสัทอักษรของบางการ์ดไม่สำเร็จ (ต้องใช้อินเทอร์เน็ต) คุณกดปุ่มค้นหาสัทอักษรในหน้าชุดการ์ดภายหลังได้",
    failed: "บันทึกไม่สำเร็จ โปรดลองอีกครั้ง",
    saving: "กำลังบันทึก…",
    button: { other: "บันทึก {count} การ์ด" },
  },
  replaceModal: {
    title: "แทนที่การ์ดทั้งหมดหรือไม่",
    body: {
      other: "การ์ดเดิมทั้งหมดในชุดนี้จะถูกลบถาวรและแทนที่ด้วย {count} การ์ดที่คุณเพิ่งกรอก",
    },
    confirm: "แทนที่",
  },
  fields: { question: "คำถาม", answer: "คำตอบ", explanation: "คำอธิบาย" },
  preview: {
    valid: { other: "การ์ดที่ใช้ได้ {count} ใบ" },
    errorRows: { other: "แถวที่มีข้อผิดพลาด {count} แถว (ข้าม)" },
    errorTitle: "แถวต่อไปนี้อ่านไม่ได้และจะถูกข้าม",
    empty: "ไม่มีการ์ดเหลือให้นำเข้า",
    delete: "ลบ",
    required: "ต้องไม่เว้นว่าง",
    card: "การ์ด",
    deleteCard: "ลบการ์ดที่ {n}",
    fieldLabel: "{field} — การ์ดที่ {n}",
  },
  dropzone: {
    aria: "เลือกหรือลากและวางไฟล์เพื่อนำเข้า",
    prompt: "ลากและวางไฟล์ที่นี่ หรือ",
    promptAction: "คลิกเพื่อเลือกไฟล์",
    supported: "รองรับ .csv, .xlsx, .xls, .md, .markdown, .txt",
    clear: "ลบไฟล์ที่เลือก",
  },
};

export default importNs;
