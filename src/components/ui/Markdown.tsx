/* eslint-disable @typescript-eslint/no-unused-vars -- `node` is destructured out so it is not spread onto DOM elements */
import type { ComponentProps } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const components: Components = {
  p: ({ node: _n, className, ...props }) => <p className={cn("my-1.5 first:mt-0 last:mb-0", className)} {...props} />,
  ul: ({ node: _n, className, ...props }) => (
    <ul className={cn("my-1.5 list-disc space-y-0.5 pl-5 text-left first:mt-0 last:mb-0", className)} {...props} />
  ),
  ol: ({ node: _n, className, ...props }) => (
    <ol className={cn("my-1.5 list-decimal space-y-0.5 pl-5 text-left first:mt-0 last:mb-0", className)} {...props} />
  ),
  li: ({ node: _n, ...props }) => <li {...props} />,
  strong: ({ node: _n, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node: _n, ...props }) => <em className="italic" {...props} />,
  a: ({ node: _n, ...props }) => (
    <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  h1: ({ node: _n, ...props }) => <p className="my-1.5 text-base font-bold first:mt-0" {...props} />,
  h2: ({ node: _n, ...props }) => <p className="my-1.5 text-base font-bold first:mt-0" {...props} />,
  h3: ({ node: _n, ...props }) => <p className="my-1.5 font-semibold first:mt-0" {...props} />,
  h4: ({ node: _n, ...props }) => <p className="my-1.5 font-semibold first:mt-0" {...props} />,
  h5: ({ node: _n, ...props }) => <p className="my-1.5 font-semibold first:mt-0" {...props} />,
  h6: ({ node: _n, ...props }) => <p className="my-1.5 font-semibold first:mt-0" {...props} />,
  blockquote: ({ node: _n, ...props }) => (
    <blockquote className="my-1.5 border-l-4 border-slate-200 pl-3 text-left opacity-90" {...props} />
  ),
  hr: () => <hr className="my-3 border-slate-200" />,
  pre: ({ node: _n, ...props }) => (
    <pre
      className="my-2 max-w-full overflow-x-auto rounded-lg bg-slate-900 p-3 text-left text-sm leading-relaxed text-slate-100 [&_code]:whitespace-pre [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      {...props}
    />
  ),
  code: ({ node: _n, className, ...props }) => (
    <code
      className={cn("rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-slate-800 break-words", className)}
      {...props}
    />
  ),
  table: ({ node: _n, ...props }) => (
    <div className="my-2 max-w-full overflow-x-auto text-left">
      <table className="w-max min-w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: ({ node: _n, ...props }) => (
    <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold" {...props} />
  ),
  td: ({ node: _n, ...props }) => <td className="border border-slate-200 px-2 py-1 align-top" {...props} />,
};

/** Compact Markdown renderer. Raw HTML is not rendered (react-markdown escapes it by default). */
export function Markdown({
  children,
  className,
  ...rest
}: { children: string; className?: string } & Omit<ComponentProps<"div">, "children">) {
  return (
    <div className={cn("min-w-0 max-w-full break-words", className)} {...rest}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
