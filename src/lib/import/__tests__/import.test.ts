import { describe, expect, it } from "vitest";
import { utils, write } from "xlsx";
import { parseCsv, parseFile, parseMarkdown, parseXlsx } from "../index";

function makeXlsx(aoa: unknown[][]): ArrayBuffer {
  const wb = utils.book_new();
  utils.book_append_sheet(wb, utils.aoa_to_sheet(aoa), "Sheet1");
  const out = write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return out;
}

describe("parseCsv", () => {
  it("parses header with English aliases", () => {
    const r = parseCsv("question,answer,explanation\nQ1,A1,E1\nQ2,A2,");
    expect(r.errors).toEqual([]);
    expect(r.cards).toEqual([
      { question: "Q1", answer: "A1", explanation: "E1" },
      { question: "Q2", answer: "A2" },
    ]);
  });

  it("recognizes Vietnamese headers with diacritics, any order/case", () => {
    const r = parseCsv("Giải thích,ĐÁP ÁN,Câu hỏi\nex,ans,ques");
    expect(r.cards).toEqual([{ question: "ques", answer: "ans", explanation: "ex" }]);
  });

  it("recognizes Term/Definition/Example", () => {
    const r = parseCsv("Term,Definition,Ví dụ\nhello,xin chào,Hello world");
    expect(r.cards[0]).toEqual({ question: "hello", answer: "xin chào", explanation: "Hello world" });
  });

  it("falls back to columns 1/2/3 without header", () => {
    const r = parseCsv("What is JS?,A language,Used in browsers\nWhat is TS?,Typed JS");
    expect(r.cards).toEqual([
      { question: "What is JS?", answer: "A language", explanation: "Used in browsers" },
      { question: "What is TS?", answer: "Typed JS" },
    ]);
  });

  it("reports errors with 1-based source rows and skips blank rows", () => {
    const r = parseCsv("question,answer\nQ1,A1\n\n,A2\nQ3,\n,\nQ4,A4");
    expect(r.cards.map((c) => c.question)).toEqual(["Q1", "Q4"]);
    expect(r.errors).toEqual([
      { row: 4, code: "missingQuestion" },
      { row: 5, code: "missingAnswer" },
    ]);
  });

  it("detects semicolon and tab delimiters", () => {
    expect(parseCsv("question;answer\nQ;A").cards).toEqual([{ question: "Q", answer: "A" }]);
    expect(parseCsv("question\tanswer\nQ\tA").cards).toEqual([{ question: "Q", answer: "A" }]);
  });

  it("handles quoted multiline fields and escaped quotes", () => {
    const r = parseCsv('question,answer\n"Line1\nLine2","He said ""hi"", ok"');
    expect(r.cards).toEqual([{ question: "Line1\nLine2", answer: 'He said "hi", ok' }]);
  });

  it("strips UTF-8 BOM and trims values", () => {
    const r = parseCsv("﻿question,answer\n  Q ,  A  ");
    expect(r.cards).toEqual([{ question: "Q", answer: "A" }]);
  });

  it("returns empty result for empty input", () => {
    expect(parseCsv("")).toEqual({ cards: [], errors: [] });
  });
});

describe("parseXlsx", () => {
  it("round-trips a workbook with header", () => {
    const r = parseXlsx(
      makeXlsx([
        ["Câu hỏi", "Đáp án", "Giải thích"],
        ["Q1", "A1", "E1"],
        [],
        ["Q2", "A2"],
        ["", "A3"],
      ]),
    );
    expect(r.cards).toEqual([
      { question: "Q1", answer: "A1", explanation: "E1" },
      { question: "Q2", answer: "A2" },
    ]);
    expect(r.errors).toEqual([{ row: 5, code: "missingQuestion" }]);
  });

  it("falls back to positional columns without header", () => {
    const r = parseXlsx(makeXlsx([["a", "b", "c"], ["d", "e"]]));
    expect(r.cards).toEqual([
      { question: "a", answer: "b", explanation: "c" },
      { question: "d", answer: "e" },
    ]);
  });

  it("keeps inner newlines and numbers as text", () => {
    const r = parseXlsx(makeXlsx([["question", "answer"], ["x\ny", 42]]));
    expect(r.cards).toEqual([{ question: "x\ny", answer: "42" }]);
  });
});

describe("parseMarkdown", () => {
  it("heading style with blockquote and --- explanation", () => {
    const md = `# Bộ thẻ\n\n## Closure là gì?\nMột hàm nhớ scope.\nDòng 2\n> Ví dụ: counter\n\n## Hoisting\nĐưa khai báo lên đầu.\n---\nGiải thích thêm\n\n## Trống\n`;
    const r = parseMarkdown(md);
    expect(r.cards).toEqual([
      { question: "Closure là gì?", answer: "Một hàm nhớ scope.\nDòng 2", explanation: "Ví dụ: counter" },
      { question: "Hoisting", answer: "Đưa khai báo lên đầu.", explanation: "Giải thích thêm" },
    ]);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].row).toBe(13);
  });

  it("Q/A style with E: and multiline", () => {
    const md = `Q: What is HTML?\nA: Markup language\nfor the web\nE: HyperText\n\nQ: What is CSS?\nA: Styles\n`;
    const r = parseMarkdown(md);
    expect(r.cards).toEqual([
      { question: "What is HTML?", answer: "Markup language\nfor the web", explanation: "HyperText" },
      { question: "What is CSS?", answer: "Styles" },
    ]);
  });

  it("Vietnamese Q/A keys", () => {
    const md = `Hỏi: DNS là gì?\nĐáp: Hệ thống tên miền\nGiải thích: Domain Name System`;
    expect(parseMarkdown(md).cards).toEqual([
      { question: "DNS là gì?", answer: "Hệ thống tên miền", explanation: "Domain Name System" },
    ]);
  });

  it("Q/A reports card without answer", () => {
    const r = parseMarkdown("Q: One\nA: 1\n\nQ: Two\n");
    expect(r.cards).toHaveLength(1);
    expect(r.errors).toEqual([{ row: 4, code: "missingAnswer" }]);
  });

  it("table style with Vietnamese header", () => {
    const md = `| Thuật ngữ | Định nghĩa | Ví dụ |\n|---|---|---|\n| API | Giao diện lập trình | REST |\n| SQL | Ngôn ngữ truy vấn |  |\n|  | thiếu |  |`;
    const r = parseMarkdown(md);
    expect(r.cards).toEqual([
      { question: "API", answer: "Giao diện lập trình", explanation: "REST" },
      { question: "SQL", answer: "Ngôn ngữ truy vấn" },
    ]);
    expect(r.errors).toEqual([{ row: 5, code: "missingQuestion" }]);
  });

  it("table without alias header uses positional columns", () => {
    const md = `| a | b |\n|---|---|\n| c | d |`;
    expect(parseMarkdown(md).cards).toEqual([
      { question: "a", answer: "b" },
      { question: "c", answer: "d" },
    ]);
  });

  it("errors on unrecognised text", () => {
    const r = parseMarkdown("just some text");
    expect(r.cards).toEqual([]);
    expect(r.errors).toHaveLength(1);
  });

  it("handles CRLF", () => {
    expect(parseMarkdown("Q: a\r\nA: b\r\n").cards).toEqual([{ question: "a", answer: "b" }]);
  });
});

describe("parseFile", () => {
  it("dispatches by extension", async () => {
    const csv = await parseFile(new File(["question,answer\nQ,A"], "x.CSV"));
    expect(csv.cards).toHaveLength(1);
    const md = await parseFile(new File(["Q: a\nA: b"], "x.md"));
    expect(md.cards).toHaveLength(1);
    const xl = await parseFile(new File([makeXlsx([["question", "answer"], ["q", "a"]])], "x.xlsx"));
    expect(xl.cards).toHaveLength(1);
    const txt = await parseFile(new File(["q,a"], "x.txt"));
    expect(txt.cards).toEqual([{ question: "q", answer: "a" }]);
  });

  it("throws UnsupportedFormatError for unsupported extension", async () => {
    await expect(parseFile(new File(["x"], "x.pdf"))).rejects.toThrow(/Unsupported file format/);
  });
});

describe("phonetic columns", () => {
  it("parses phonetic and part-of-speech columns from CSV (aliases)", () => {
    const r = parseCsv("term,definition,IPA,Từ loại,example\nable,có khả năng,/ˈeɪbl/,adjective,He is able.\nrun,chạy,,,");
    expect(r.errors).toEqual([]);
    expect(r.cards).toEqual([
      { question: "able", answer: "có khả năng", explanation: "He is able.", phonetic: "/ˈeɪbl/", partOfSpeech: "adjective" },
      { question: "run", answer: "chạy" },
    ]);
  });

  it("accepts Phiên âm / pos / pronunciation / word type headers", () => {
    expect(parseCsv("question,answer,Phiên âm,pos\nx,y,/a/,noun").cards[0]).toMatchObject({
      phonetic: "/a/",
      partOfSpeech: "noun",
    });
    expect(parseCsv("question,answer,pronunciation,word type\nx,y,/b/,verb").cards[0]).toMatchObject({
      phonetic: "/b/",
      partOfSpeech: "verb",
    });
  });

  it("reads phonetic columns from XLSX", () => {
    const r = parseXlsx(makeXlsx([["question", "answer", "phonetic", "type"], ["able", "có thể", "/ˈeɪbl/", "adjective"]]));
    expect(r.cards).toEqual([{ question: "able", answer: "có thể", phonetic: "/ˈeɪbl/", partOfSpeech: "adjective" }]);
  });

  it("reads phonetic columns from a Markdown table", () => {
    const md = "| term | definition | phonetic |\n|---|---|---|\n| able | có thể | /ˈeɪbl/ |";
    expect(parseMarkdown(md).cards).toEqual([{ question: "able", answer: "có thể", phonetic: "/ˈeɪbl/" }]);
  });

  it("parses P: and Phiên âm: lines in Markdown Q/A", () => {
    const md = "Q: able\nP: /ˈeɪbl/\nA: có thể\n\nQ: baker\nPhiên âm: /ˈbeɪkər/\nA: thợ làm bánh\nE: A baker.";
    const r = parseMarkdown(md);
    expect(r.errors).toEqual([]);
    expect(r.cards).toEqual([
      { question: "able", answer: "có thể", phonetic: "/ˈeɪbl/" },
      { question: "baker", answer: "thợ làm bánh", explanation: "A baker.", phonetic: "/ˈbeɪkər/" },
    ]);
  });
});

describe("parseMarkdown bold-question style", () => {
  it("strips number prefix; EN -> explanation, VI -> answer", () => {
    const md = `# Title\n\nIntro paragraph.\n\n**1. What is a closure? / Closure là gì?**\n\nEN: A function that remembers scope.\n\nVI: Hàm nhớ scope.\n\n**2. Second?**\n\nEN: two\n\nVI: hai\n`;
    const r = parseMarkdown(md);
    expect(r.errors).toEqual([]);
    expect(r.cards).toEqual([
      { question: "What is a closure? / Closure là gì?", answer: "Hàm nhớ scope.", explanation: "A function that remembers scope." },
      { question: "Second?", answer: "hai", explanation: "two" },
    ]);
  });

  it("code block between question and EN/VI goes to the question", () => {
    const md = "**6. Output order?**\n\n```js\nconsole.log('A');\n```\n\nEN: A\n\nVI: A, rồi B\n";
    const r = parseMarkdown(md);
    expect(r.cards).toEqual([
      { question: "Output order?\n\n```js\nconsole.log('A');\n```", answer: "A, rồi B", explanation: "A" },
    ]);
  });

  it("VI runs to the end of the card including code and lists", () => {
    const md = "**1. Q**\n\nEN: english\n\nVI: tiếng Việt:\n\n- a\n- b\n\n```js\nEN: not a label\n**not a question**\n```\n\n**2. Next**\n\nVI: ok\n";
    const r = parseMarkdown(md);
    expect(r.cards).toHaveLength(2);
    expect(r.cards[0].answer).toBe("tiếng Việt:\n\n- a\n- b\n\n```js\nEN: not a label\n**not a question**\n```");
    expect(r.cards[0].explanation).toBe("english");
    expect(r.cards[1]).toEqual({ question: "Next", answer: "ok" });
  });

  it("no labels: whole body is the answer", () => {
    const r = parseMarkdown("**Q without number**\n\nLine one\n\nLine two\n");
    expect(r.cards).toEqual([{ question: "Q without number", answer: "Line one\n\nLine two" }]);
  });

  it("headings end a card and are ignored; missing answer reported", () => {
    const md = "## 1. JS\n\nMẹo: ignored\n\n**1. A?**\n\nVI: a\n\n## 2. TS\n\nMẹo: also ignored\n\n**1. B?**\n";
    const r = parseMarkdown(md);
    expect(r.cards).toEqual([{ question: "A?", answer: "a" }]);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].row).toBe(13);
  });

  it("takes priority over heading, Q/A and table styles", () => {
    const md = "## Heading\n\n**1. Bold**\n\nQ: x\nA: y\n\n| a | b |\n|---|---|\n| c | d |\n";
    const r = parseMarkdown(md);
    expect(r.cards).toHaveLength(1);
    expect(r.cards[0].question).toBe("Bold");
  });
});
