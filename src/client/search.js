export function createSearch(items) {
  const normalized = items.map((item) => ({
    ...item,
    haystack: `${item.title} ${item.description} ${item.content} ${item.method || ""} ${item.path || ""}`.toLowerCase()
  }));

  return function searchDocs(query) {
    const value = query.trim().toLowerCase();
    if (!value) return [];

    return normalized
      .map((item) => {
        const score = value
          .split(/\s+/)
          .filter(Boolean)
          .reduce((total, part) => total + (item.haystack.includes(part) ? 1 : 0), 0);
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 8);
  };
}
