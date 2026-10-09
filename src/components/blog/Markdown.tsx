import Link from "next/link";
import { ChevronDown, Lightbulb, Phone } from "lucide-react";
import { siteImages, type SiteImageKey } from "@/config/images";
import { theme } from "@/config/theme";
import { InquiryButton } from "@/components/inquiry";
import { Photo } from "@/components/ui";
import { FAQ_HEADING, slugify } from "@/lib/blog";
import type { InquiryService } from "@/lib/inquiries/schema";

/**
 * Tiny, safe Markdown renderer for guide articles (no raw HTML).
 *
 * Supported: ## / ### headings, paragraphs, - and 1. lists, > callouts,
 * **bold**, [links](/path/), ![caption](imageKey) photos from
 * src/config/images.ts, a "## Frequently asked questions" section of ### Q&As,
 * and a [[cta]] line that renders a quote request card.
 */

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "image"; image: SiteImageKey; caption: string }
  | { type: "cta" }
  | { type: "faq"; items: { question: string; answer: string[] }[] };

function parse(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isSpecial = (line: string) =>
    /^(#{2,3} |[-*] |\d+\. |> |!\[|\[\[cta\]\])/.test(line) || line.trim() === "";

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      if (text === FAQ_HEADING) {
        blocks.push({ type: "h2", text });
        i++;
        const items: { question: string; answer: string[] }[] = [];
        while (i < lines.length && !lines[i].startsWith("## ")) {
          if (lines[i].startsWith("### ")) {
            items.push({ question: lines[i].slice(4).trim(), answer: [] });
          } else if (lines[i].trim() && items.length) {
            items[items.length - 1].answer.push(lines[i].trim());
          }
          i++;
        }
        blocks.push({ type: "faq", items });
        continue;
      }
      blocks.push({ type: "h2", text });
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }

    if (line.trim() === "[[cta]]") {
      blocks.push({ type: "cta" });
      i++;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) {
      const key = image[2].trim();
      if (!(key in siteImages)) throw new Error(`Unknown image "${key}" in article`);
      blocks.push({ type: "image", image: key as SiteImageKey, caption: image[1] });
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) parts.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "callout", text: parts.join(" ") });
      continue;
    }

    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i]) : /^[-*] /.test(lines[i]))) {
        items.push(lines[i++].replace(/^([-*]|\d+\.) /, ""));
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }

    const parts: string[] = [];
    while (i < lines.length && !isSpecial(lines[i])) parts.push(lines[i++].trim());
    blocks.push({ type: "p", text: parts.join(" ") });
  }

  return blocks;
}

/** Inline **bold** and [links](href). */
function Inline({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith("**") && token.endsWith("**")) return <strong key={i}>{token.slice(2, -2)}</strong>;
        const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          if (href.startsWith("/")) {
            return (
              <Link key={i} href={href}>
                {label}
              </Link>
            );
          }
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
}

interface MarkdownProps {
  source: string;
  /** Pre-selects the quote form service for [[cta]] cards. */
  inquiryService?: InquiryService;
}

export function Markdown({ source, inquiryService }: MarkdownProps) {
  const blocks = parse(source);

  return (
    <div className="prose-article">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={index} id={slugify(block.text)}>
                {block.text}
              </h2>
            );
          case "h3":
            return <h3 key={index}>{block.text}</h3>;
          case "p":
            return (
              <p key={index}>
                <Inline text={block.text} />
              </p>
            );
          case "ul":
          case "ol": {
            const List = block.type;
            return (
              <List key={index}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "callout":
            return (
              <aside key={index} className="callout">
                <Lightbulb className="h-5 w-5 flex-shrink-0 text-gold-700" aria-hidden="true" />
                <p>
                  <Inline text={block.text} />
                </p>
              </aside>
            );
          case "image":
            return (
              <figure key={index}>
                <Photo image={block.image} aspect={16 / 9} sizes="(min-width: 1024px) 720px, 100vw" className="aspect-[16/9]" />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          case "cta":
            return (
              <div key={index} className="not-prose my-10 rounded-[var(--radius-xl)] bg-navy-900 p-6 text-white md:p-8">
                <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">
                  Want a local technician to take a look?
                </p>
                <p className="mt-2 text-white/75">
                  JD Home Services is based in Oshawa and works across Durham Region. Tell us what&apos;s going on and
                  we&apos;ll get back to you with clear options.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <InquiryButton service={inquiryService}>Get a free quote</InquiryButton>
                  <a href={`tel:${theme.contact.phone.tel}`} className="btn btn-ghost-light">
                    <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                    {theme.contact.phone.display}
                  </a>
                </div>
              </div>
            );
          case "faq":
            return (
              <div key={index} className="not-prose mt-6 space-y-3">
                {block.items.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-[var(--radius-lg)] border border-line bg-white open:shadow-[var(--shadow-md)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                      <h3 className="text-base font-semibold text-ink">{faq.question}</h3>
                      <ChevronDown
                        className="h-5 w-5 flex-shrink-0 text-navy-600 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="space-y-3 px-5 pb-5 leading-relaxed text-ink-2">
                      {faq.answer.map((para, j) => (
                        <p key={j}>
                          <Inline text={para} />
                        </p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}

export default Markdown;
