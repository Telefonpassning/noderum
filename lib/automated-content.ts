import entries from "@/content/automated.json"

type Entry = {
  slug: string
  kind: "blog" | "guider"
  title: string
  description: string
  date: string
  body: string[]
  links: { match: string; href: string }[]
  sourceUrl: string
}

// Content Ops writes data only. A failed contract stops the build before publication.
const seen = new Set<string>()
const reserved = new Set(["menodi-produktuppdatering", "menodi-lansering", "websiteforge-live", "noderum-grundas", "ai-receptionist-smb", "bygga-ai-bolag-sverige", "agande-som-drivkraft", "smb-digitalisering", "framtidens-venture-studio"])
export const automatedContent: Entry[] = entries as Entry[]
for (const item of automatedContent) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || seen.has(item.slug) || reserved.has(item.slug)) throw new Error("Invalid or duplicate automated slug")
  seen.add(item.slug)
  if (!["blog", "guider"].includes(item.kind) || !/^\d{4}\.\d{2}\.\d{2}$/.test(item.date) || !item.title || !item.description || !Array.isArray(item.body) || !item.body.length || item.body.some(p => typeof p !== "string")) throw new Error("Invalid automated article")
  const source = new URL(item.sourceUrl)
  if (source.protocol !== "https:" || source.hostname !== "menodi.se") throw new Error("Invalid source")
  if (!Array.isArray(item.links)) throw new Error("Missing links")
  for (const link of item.links) {
    const url = new URL(link.href)
    if (!link.match || url.protocol !== "https:" || url.hostname !== "menodi.se" || !item.body.some(p => p.includes(link.match))) throw new Error("Invalid automated link")
  }
}

export function automatedArticles(kind: Entry["kind"]) {
  return Object.fromEntries(automatedContent.filter(item => item.kind === kind).map(item => [item.slug, {
    ...item,
    tag: "AI",
    linksByParagraph: Object.fromEntries(item.body.map((_, index) => [index, item.links])),
    related: [{ href: item.sourceUrl, label: "Fördjupning hos Menodi" }],
  }]))
}
