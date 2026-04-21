// Используем объект для параметров, чтобы не путаться в порядке аргументов
import { html, render } from '../../modules/lit-all.min.js';

export default async function displayPagination(config) {
  const { selector, displayDataFn } = config;

  const result = await getPaginationData(config);
  if (!result) return;
  const { statsData, pagination } = result;

  // Передача данных в колбэк
  displayDataFn(statsData);

  // Отрисовка навигации
  renderPaginationNav(pagination, selector);

  // Делегирование событий: вешаем обработчик один раз на родителя
  const navContainer = document.querySelector(selector);

  // Удаляем старый обработчик перед добавлением нового (если нужно)
  navContainer.onclick = event => {
    const btn = event.target.closest('.page-link');
    if (!btn) return;

    const targetPage = parseInt(btn.dataset.page, 10);
    displayPagination({
      ...config,
      currentPage: targetPage,
      startPage: pagination.startPage, // сохраняем текущую стартовую страницу
    });
  };
}

async function getPaginationData({ numberOfRecordsFn, itemPageFn, currentPage = 1, startPage = 1, pageSize = 100, maxPages = 10 }) {
  const totalRecords = await numberOfRecordsFn();
  if (totalRecords === 0) return null;

  const pagination = paginate(totalRecords, currentPage, startPage, pageSize, maxPages);
  const statsData = await itemPageFn(pagination.startIndex, pagination.pageSize);

  return { statsData, pagination };
}

function renderPaginationNav({ totalPages, currentPage, pages }, selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const navHtml = html` <div class="extension-pagination-sidebar">
    ${pages.map(
      page => html`
    <a class="page-link" data-page="${page}" style="cursor: pointer;">
      <div class="nav-icon_menu" ${page === currentPage ? 'font-weight: bold;' : ''}">${page}</div>
    </a>
  `,
    )}
    <span class="settings-input-number page_number"> ${currentPage} / ${totalPages}</span>
  </div>`;

  render(navHtml, container);
}
