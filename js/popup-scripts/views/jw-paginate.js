/* eslint-disable no-unused-vars */
function paginate(total, current = 1, start = 1, size = 10, max = 10) {
  let [, currentPage, startPage] = [total, current, start, size, max].map(Number);
  const [totalItems, , , pageSize, maxPages] = [total, current, start, size, max].map(Number);
  // calculate total number of pages
  const totalPages = Math.ceil(totalItems / pageSize);
  // make sure the current page is not out of range
  if (currentPage < 1) currentPage = 1;
  else if (currentPage > totalPages) currentPage = totalPages;
  let endPage;
  if (totalPages <= maxPages) {
    // the total number of pages is less than the maximum, so show all pages
    startPage = 1;
    endPage = totalPages;
  } else {
    // the total number of pages is greater than the maximum, so calculate the start and end pages
    const maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
    const pozition = currentPage - startPage;
    // current page is closer to the top
    if (pozition < maxPagesBeforeCurrentPage) {
      const previousPages = currentPage - maxPagesBeforeCurrentPage;
      startPage = previousPages > 0 ? previousPages : 1;
      endPage = startPage + maxPages;
    } else if (pozition > maxPagesBeforeCurrentPage) {
      // current page near the end
      const nextPage = currentPage + maxPagesBeforeCurrentPage;
      startPage = nextPage + maxPages > totalPages ? totalPages - maxPages : nextPage;
      endPage = startPage + maxPages;
    } else {
      // the current page is somewhere in the middle
      endPage = startPage + maxPages;
    }
  }
  // calculate indexes of start and end elements
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
  // create array of pages for ng-repeat in pager control
  const pages = Array.from(Array(endPage + 1 - startPage).keys()).map(i => startPage + i);
  // returned object with all pager properties required by the view
  return {
    totalItems,
    currentPage,
    pageSize,
    totalPages,
    startPage,
    endPage,
    startIndex,
    endIndex,
    pages,
  };
}
