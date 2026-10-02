import { hashPassword } from "../src/lib/auth/password";

/** Reads a line without echo from a TTY (raw mode). */
function promptHidden(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    process.stderr.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let buf = "";
    const done = (fn: () => void) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      process.stderr.write("\n");
      fn();
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n" || ch === "\u0004") return done(() => resolve(buf));
        if (ch === "\u0003") return done(() => reject(new Error("Đã huỷ")));
        if (ch === "\u007f" || ch === "\b") buf = buf.slice(0, -1);
        else buf += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function readPiped(): Promise<string> {
  let data = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) data += chunk;
  return data.replace(/\r?\n$/, "");
}

async function main() {
  const password = process.stdin.isTTY ? await promptHidden("Mật khẩu (8–128 ký tự): ") : await readPiped();
  if (password.length < 8 || password.length > 128) {
    throw new Error("Mật khẩu phải dài 8–128 ký tự.");
  }
  process.stdout.write((await hashPassword(password)) + "\n");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
