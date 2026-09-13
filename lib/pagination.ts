export function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const delta = 1; // pages visibles autour de la page actuelle
  const pages: (number | "ellipsis")[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const isEdge = i === 1 || i === totalPages;
    const isNearCurrent = Math.abs(i - currentPage) <= delta;
    if (isEdge || isNearCurrent) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }
  return pages;
}
