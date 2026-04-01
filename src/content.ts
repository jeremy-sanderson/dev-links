// Environment variables injected at build time by esbuild's `define`
declare const __JIRA_PREFIXES__: string;
declare const __JIRA_BASE_URL__: string;
declare const __SCAN_INTERVAL__: string;

const PROCESSED_ATTR = "data-jira-linked";

function buildJiraRegex(prefixes: string): RegExp {
  // Split comma-separated prefixes, trim whitespace, build alternation
  const escaped = prefixes
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .join("|");
  // Match PREFIX-DIGITS with word boundaries (case-insensitive)
  return new RegExp(`\\b((?:${escaped})-\\d+)\\b`, "gi");
}

function isInsideLink(node: Node): boolean {
  let current = node.parentElement;
  while (current) {
    if (current.tagName === "A") return true;
    current = current.parentElement;
  }
  return false;
}

function isInsideProcessedContainer(node: Node): boolean {
  let current = node.parentElement;
  while (current) {
    if (current.hasAttribute(PROCESSED_ATTR)) return true;
    current = current.parentElement;
  }
  return false;
}

function linkifyTextNode(textNode: Text, regex: RegExp, baseUrl: string): void {
  const text = textNode.textContent;
  if (!text) return;

  regex.lastIndex = 0;
  const matches: Array<{ index: number; length: number; id: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ index: match.index, length: match[0].length, id: match[0] });
  }

  if (matches.length === 0) return;

  const parent = textNode.parentNode;
  if (!parent) return;

  // Build replacement fragment
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const m of matches) {
    // Text before the match
    if (m.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
    }

    // The link
    const link = document.createElement("a");
    link.href = baseUrl + m.id;
    link.textContent = m.id;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute(PROCESSED_ATTR, "true");
    fragment.appendChild(link);

    lastIndex = m.index + m.length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  parent.replaceChild(fragment, textNode);
}

function scanAndLinkify(): void {
  const regex = buildJiraRegex(__JIRA_PREFIXES__);
  const baseUrl = __JIRA_BASE_URL__;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Text): number {
      if (!node.textContent || node.textContent.trim().length === 0) {
        return NodeFilter.FILTER_REJECT;
      }
      if (isInsideLink(node)) return NodeFilter.FILTER_REJECT;
      if (isInsideProcessedContainer(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  // Collect nodes first (modifying DOM during walk is unsafe)
  const textNodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    textNodes.push(current as Text);
  }

  for (const textNode of textNodes) {
    linkifyTextNode(textNode, regex, baseUrl);
  }
}

// Initial scan
scanAndLinkify();

// Re-scan on interval
const interval = parseInt(__SCAN_INTERVAL__, 10) || 30000;
setInterval(scanAndLinkify, interval);
