/* eslint-disable import/extensions */
/* eslint-disable import/prefer-default-export */
import { html, render, nothing } from './lit-all.min.js';

import formatRelative from './extDate.js';

export function insertExtensionSettingsTab(tab, setting_container, heder, description, pasteOptionDom = 'beforeend') {
  // 1. Создаем шаблон (TemplateResult)
  const settingsTemplate = html`
    <div id="${setting_container}">
      <h1>${heder}</h1>
      <p>${description}</p>
      <div class="settings-container"></div>
    </div>
  `;

  // 2. Рендерим в целевой элемент
  // Примечание: render() в Lit по умолчанию заменяет содержимое.
  // Чтобы имитировать 'beforeend', можно создать контейнер-пустышку.
  const container = document.createElement('div');
  tab.insertAdjacentElement(pasteOptionDom, container);

  render(settingsTemplate, container);
}

export function insertExtensionSetting(dom, setting_n, setting_d, data, name, input_type, pasteOptionDom = 'beforeend') {
  // 1. Создаем объект-карту для разных типов ввода
  const inputTemplates = {
    number: ({ step, min, max }) => html` <input class="settings-input settings-input-number" id="${name}" name="${name}" type="number" value="${data[name]}" min="${min}" max="${max}" step="${step}" />`,

    text: ({ attribute }) => html` <input class="${name}" id="${name}" name="${name}" type="text" .value="${data[name] ?? ''}" ${attribute} />`,

    url: ({ attribute }) => html` <input class="${name}" id="${name}" name="${name}" type="text" .value="${data[name] ?? ''}" ${attribute} />`,

    checkbox: () =>
      html` <label class="settings-input input-value-checkbox my-switch">
        <input id="${name}" name="${name}" class="removeOrder" type="checkbox" ?checked="${data[name]}" />
        <span class="list-remove"></span>
      </label>`,

    color: () => html` <input class="settings-input settings-input-color" id="${name}" .value="${data[name]}" name="${name}" type="color" />`,
  };

  const { type_name } = input_type;

  // 2. Получаем нужный шаблон из объекта
  const getTemplate = inputTemplates[type_name];
  if (!getTemplate) return;

  const inputElement = getTemplate(input_type);

  // 3. Собираем финальный блок через Lit html
  const settingBlock = html`
    <div class="settings-card">
      <div class="settings-card-body">
        <input class="settings-show-info-checkbox" type="checkbox" />
        <div class="settings-info">${setting_d}</div>
        <div class="settings-card-description">
          <span class="settings-card-description-text">${setting_n}</span>
          ${inputElement}
        </div>
      </div>
    </div>
  `;

  // 4. Рендерим (для вставки в DOM используем временный контейнер или helper)
  const container = document.createElement('div');
  render(settingBlock, container);
  dom.insertAdjacentElement(pasteOptionDom, container.firstElementChild);
}

export function selectClan(container, clanList) {
  const arrId = clanList.split(', ');
  // Создаем массив шаблонов через .map()
  // Оборачиваем в select и рендерим в контейнер
  const template = html`
    <select name="selectClan" id="selectClan" class="extension-data-block select-clan">
      ${arrId.map(clanId => html` <option value="${clanId}">${clanId}</option> `)}
    </select>
  `;
  render(template, container);
}

export function userTableRow(dom, data, tags, pasteOptionDom = 'beforeend') {
  const { account_id, nickname, role, joined_at, statistics, icon, requirement, color } = data;
  const { battles, winRate, avgDamage, last_battle_time } = statistics; // статистика

  const joined_at_time_ago = formatRelative(joined_at * 1000, 'ru', 'short');
  const last_battle_time_ago = formatRelative(last_battle_time * 1000, 'ru', 'short');

  let tagsDomBlock = nothing; // По умолчанию ничего не выводим
  if (tags.length > 0) {
    tagsDomBlock = html` <li class="extension-responsive-table__row extension-responsive-table-li extension-responsive-table__col-tags" id="tags-${account_id}">
      <div class="extension-responsive-table__col extension-item__data extension-item__data-tags">
        ${tags.map(
          tag =>
            html` <div class="tags-row">
              <div class="cutout-element cutout-element__left"></div>
              <div class="text">${tag.value}</div>
              <div class="cutout-element cutout-element__right"></div>
            </div>`,
        )}
      </div>
    </li>`;
  }
  const responsiveTableRow = html` <div class="extension-responsive-table__item account-rows" id="account_id-${account_id}">
    <li class="extension-responsive-table__row extension-responsive-table-li">
      <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" data-label="Name">
        <p class="extension-item__data extension-responsive-table__badge">
          <img class="select-img " src="${chrome.runtime.getURL(`${icon}`)}" />
          ${role}
        </p>
        <div class="extension-responsive-table__col extension-item__data shadow-wrap badge">
          <div class="badge">
            <div class="blob"></div>
            <p class="blob-description">${requirement}</p>
          </div>
        </div>
        <span>${nickname}</span>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position" data-label="Date">
        <div class=" ">📅 ${joined_at_time_ago}</div>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position" data-label="Date">
        <div class="">⌛ ${last_battle_time_ago}</div>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position" data-label="Date">
        <div class="">⚔️ ${battles}</div>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min" data-label="Date">
        <div class="extension-item__data">
          <div class="extension-item__img-border" style="border-color: ${color};"></div>
          <p class="blob-description">%${winRate}</p>
        </div>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position" data-label="Price">
        <div class="">💥 ${avgDamage}</div>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-responsive-table__col_hidden-block extension-item__data">
        <div id="p_chart-${account_id}" class="mini-chart ">
          <canvas id="points-chart-${account_id}" style="display:none;"></canvas>
        </div>
      </div>

      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data " style="margin: 6px 0px;">
        <div>
          Очки
          <input class="settings-input settings-input-number user-input user-input-min-height user-point" id="point-${account_id}" name="userPoints" type="number" value="${getRandomInt(0, 100)}" min="0" max="" step="1" />
        </div>
        <div>
          Кооп
          <input class="settings-input settings-input-number user-input user-input-min-height user-teamwork" id="teamwork-${account_id}" name="Teamwork" type="number" value="${getRandomInt(0, 200)}" min="0" max="" step="1" />
        </div>
      </div>
    </li>
    ${tagsDomBlock}
  </div>`;
  // Настройка разрешенных тегов и атрибутов

  // 4. Рендерим (для вставки в DOM используем временный контейнер или helper)
  const container = document.createElement('div');
  render(responsiveTableRow, container);
  dom.insertAdjacentElement(pasteOptionDom, container.firstElementChild);
}
export function userStatistics(dom, data) {
  const { avgDamage, battles, winRate } = data;
  const userStatisticDom = html` <ul class="extension-responsive-table__sidebar-row" id="user-statistic">
      <li class="extension-responsive-table-li-item">
        <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position">Урон : ${avgDamage}</div>
        <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position">Боёв: ${battles}</div>
        <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position">Побед: ${winRate}%</div>
      </li>
    </ul>

    <li class="extension-responsive-table-li-item" id="add-block">
      <div class="extension-responsive-table__col extension-responsive-table__col_width-max">
        Дата
        <input class="settings-input settings-input-number user-input user-input-max-height flatpickr-input" id="add-user-date" placeholder="Дата..." type="text" readonly="readonly" />
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-max">
        Очки
        <input class="settings-input settings-input-number user-input user-input-max-height" id="add-user-point" type="number" value="72" min="0" max="" step="1" />
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-max">
        Кооп
        <input class="settings-input settings-input-number user-input user-input-max-height" id="add-user-teamwork" type="number" value="86" min="0" max="" step="1" />
      </div>
      <a id="save-stat">
        <div class="swg-save nav-icon  nav-icon_min nav-icon_menu"></div>
      </a>
    </li>`;

  render(userStatisticDom, dom);
}

export function showUserStats(points, dom) {
  const responsiveTableRow = html`
    <ul>
      ${Object.entries(points).map(
        ([key, [point, teamwork]]) => html`
          <div class="point-container">
            <!-- Скрытый чекбокс выступает в роли "состояния" (режим редактирования ВКЛ/ВЫКЛ) -->
            <input type="checkbox" id="toggle-edit-${key}" class="state-toggle" hidden />

            <ul class="extension-responsive-table__sidebar-row side-front" id="value-block-${key}">
              <li class="extension-responsive-table-li-item">
                <a id="delete-btn-${key}">
                  <div class="swg-delete nav-icon  nav-icon_min nav-icon_menu"></div>
                </a>
                <div class="user-stats">
                  Дата
                  <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" id="user-date-${key}">${key}</div>
                </div>

                <div class="user-stats">
                  Очки
                  <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" id="user-point-${key}">${point}</div>
                </div>

                <div class="user-stats">
                  Кооп
                  <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" id="user-teamwork-${key}">${teamwork}</div>
                </div>

                <label for="toggle-edit-${key}">
                  <div class="swg-edit nav-icon  nav-icon_min nav-icon_menu" id="edit-btn-${key}"></div>
                </label>
              </li>
            </ul>

            <ul class="extension-responsive-table__sidebar-row side-back">
              <li class="extension-responsive-table-li-item">
                <a id="update-btn-${key}">
                  <div class="swg-save nav-icon  nav-icon_min nav-icon_menu"></div>
                </a>
                <div class="extension-responsive-table__col extension-responsive-table__col_width-max">
                  Дата
                  <input class="settings-input settings-input-number user-input user-input-max-height" id="edit-user-date-${key}" placeholder="Дата..." />
                </div>
                <div class="extension-responsive-table__col extension-responsive-table__col_width-max">
                  Очки
                  <input class="settings-input settings-input-number user-input user-input-max-height" id="edit-user-point-${key}" type="number" value="${point}" min="0" max="" step="1" />
                </div>
                <div class="extension-responsive-table__col extension-responsive-table__col_width-max">
                  Кооп
                  <input class="settings-input settings-input-number user-input user-input-max-height" id="edit-user-teamwork-${key}" type="number" value="${teamwork}" min="0" max="" step="1" />
                </div>
                <label for="toggle-edit-${key}" class="btn">
                  <div class="swg-close nav-icon  nav-icon_min nav-icon_menu"></div>
                </label>
              </li>
            </ul>
          </div>
        `,
      )}
    </ul>
  `;
  render(responsiveTableRow, dom);
}

export function pointsChart(divItemBlock) {
  destroyChart('pointsChart');
  const historyChartHTML = html` <div id="p_chart" class="chart">
    <canvas id="pointsChart"></canvas>
    <div class="chart-navigation">
      <button class="chart-button" id="resetChart">Вернуть</button>
    </div>
    <div class="chart-navigation"></div>
  </div>`;
  render(historyChartHTML, divItemBlock);
}

export function userRow(dom, data, clansNamesArr, pasteOptionDom = 'beforeend') {
  const { id, name, tags, ex, clanId } = data;
  const { name: clanName = clanId } = clansNamesArr.find(clan => clan.id === clanId) || {};

  let tagsDomBlock = nothing; // По умолчанию ничего не выводим

  if (tags.length > 0) {
    tagsDomBlock = html` <li class="extension-responsive-table__row extension-responsive-table-li extension-responsive-table__col-tags" id="user-tags-${id}">
      <div class="extension-responsive-table__col extension-item__data extension-item__data-tags">
        ${tags.map(
          tag =>
            html` <div class="tags-row">
              <div class="cutout-element cutout-element__left"></div>
              <div class="text">${tag.value}</div>
              <div class="cutout-element cutout-element__right"></div>
            </div>`,
        )}
      </div>
    </li>`;
  }
  const responsiveTableRow = html` <div class="extension-responsive-table__item user-data-row" id="account_id-${id}">
    <li class="extension-responsive-table__row extension-responsive-table-li">
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min market_name" data-label="Имя">${name}</div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data" data-label="Клан">${clanName}</div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data" data-label="Состоит">${ex ? 'Нет' : 'Да'}</div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-responsive-table__col_hidden-block extension-item__data" data-label="Date">
        <div id="user-p_chart-${id}" class="mini-chart ">
          <canvas id="user-points-chart-${id}" style="display: none;"></canvas>
        </div>
      </div>
    </li>
    ${tagsDomBlock}
  </div>`;
  // Настройка разрешенных тегов и атрибутов
  // (для вставки в DOM используем временный контейнер или helper)
  const container = document.createElement('div');
  render(responsiveTableRow, container);
  dom.insertAdjacentElement(pasteOptionDom, container.firstElementChild);
}

//! блок добавление настроек

function settingTemplate(itemData, prefix, fieldConfigs) {
  const { id = '' } = itemData;

  // 1. Шаблоны теперь возвращают Lit TemplateResult
  const templates = {
    color: (val, inputId) => ({
      view: html` <div class="extension-responsive-table__sidebar-row extension-item__data">
        <div class="select-color" style="background-color: ${val}"></div>
      </div>`,
      edit: html` <div class="extension-responsive-table__sidebar-row extension-item__data">
        <input class="select-color" id="${inputId}" .value="${val}" type="color" />
      </div>`,
    }),

    input: (val, inputId, type) => ({
      view: html` <div class="settings-name user-stats">
        <div class="extension-responsive-table__sidebar-row extension-responsive-table__col_width-max extension-item__data">${val}</div>
      </div>`,
      edit: html` <div class="extension-responsive-table__sidebar-row extension-responsive-table__col_width-max extension-item__data">
        <input class="settings-input settings-input-number user-input user-input-max-height" id="${inputId}" type="${type}" .value="${val ?? ''}" />
      </div>`,
    }),

    picker: (val, inputId) => ({
      view: html` <div class="user-stats select-img">
        <img id="img-${inputId}" src="${val || ''}" class="extension-responsive-table__sidebar-row extension-item__data select-img" />
      </div>`,
      edit: html` <div id="block-${inputId}"></div>
        <input class="hidden" id="${inputId}" type="text" .value="${val || ''}" />`,
    }),
  };

  // 2. Собираем массивы шаблонов (в Lit лучше рендерить массивы, чем склеивать строки)
  return fieldConfigs.reduce(
    (acc, { type, value }) => {
      const inputId = `${prefix}-input-${value}-${id}`;
      const renderKey = type === 'text' || type === 'number' ? 'input' : type;
      const renderer = templates[renderKey];

      if (renderer) {
        const result = renderer(itemData[value], inputId, type);
        acc.view.push(result.view);
        acc.edit.push(result.edit);
      }
      return acc;
    },
    { view: [], edit: [] }, // Используем массивы вместо строк
  );
}

export function renderItemBlock(container, descriptionData, insertPosition = 'beforeend') {
  const { prefix, fields, title = '', icon = '', description = '' } = descriptionData;

  // Получаем массивы шаблонов из settingTemplate (из предыдущего ответа)
  const contents = settingTemplate({}, prefix, fields);

  // Вспомогательный шаблон для элементов списка (li)
  const renderAdd = (innerHtml, btnType, iconType) => {
    const btnId = `${prefix}-${btnType}-btn`;
    const itemId = `${prefix}-${btnType}-item`;

    return html` <li class="extension-responsive-table-li" id="${itemId}">
      ${innerHtml}
      <a id="${btnId}">
        <div class="swg-${iconType} nav-icon nav-icon_min nav-icon_menu"></div>
      </a>
    </li>`;
  };

  // Финальный шаблон блока
  const itemTemplate = html`
    <div class="ext-sect">
      <div class="ext-box">
        <div class="features">
          <details class="ext-feat">
            <summary>
              <i aria-hidden="true" class="icon check swg-${icon} nav-icon"></i>
              <span class="name">${title}</span>
              <i aria-hidden="true" class="icon ask swg-question nav-icon"></i>
            </summary>
            <div class="ans">${description}</div>
          </details>
        </div>

        <ul class="extension-list-unstyled">
          <!-- Рекомендуется обернуть li в список -->
          ${renderAdd(contents.edit, 'create', 'save')}
        </ul>

        <div class="ext-wrap" id="${prefix}-list"></div>
      </div>
    </div>
  `;

  // Рендерим в контейнер
  // Если нужно именно 'beforeend', используем временный элемент или render в целевой узел
  if (insertPosition === 'beforeend') {
    const tmp = document.createElement('div');
    render(itemTemplate, tmp);
    container.appendChild(tmp.firstElementChild);
  } else {
    render(itemTemplate, container);
  }
}

export function renderItemList(container, itemData, prefix, fieldConfigs, insertPosition = 'beforeend') {
  const { id } = itemData;
  const toggleId = `${prefix}-toggle-edit-${id}`;

  // Получаем массивы шаблонов { view: [], edit: [] }
  const contents = settingTemplate(itemData, prefix, fieldConfigs);

  // Вспомогательный шаблон для сторон (Front/Back)
  const renderSide = (side, innerHtml, btnType, iconType, extraId = '') => {
    const btnId = `${prefix}-${btnType}-btn-${id}`;
    const sideId = side === 'front' ? `${prefix}-block-${id}` : undefined;
    const iconClass = btnType === 'update' ? 'save' : btnType;

    return html` <ul class="extension-responsive-table__sidebar-row side-${side}" id="${sideId ?? ''}">
      <li class="extension-responsive-table-li-item">
        <a id="${btnId}">
          <div class="swg-${iconClass} nav-icon nav-icon_min nav-icon_menu"></div>
        </a>
        ${innerHtml}
        <label for="${toggleId}" id="${extraId || ''}">
          <div class="swg-${iconType} nav-icon nav-icon_min nav-icon_menu"></div>
        </label>
      </li>
    </ul>`;
  };

  // Финальный шаблон строки
  const itemTemplate = html` <li class="ext-row">
    <div class="settings-list">
      <input type="checkbox" id="${toggleId}" class="state-toggle" hidden />
      ${renderSide('front', contents.view, 'delete', 'edit', `edit-btn-tag-${id}`)} ${renderSide('back', contents.edit, 'update', 'close')}
    </div>
  </li>`;

  // Логика вставки
  if (insertPosition === 'beforeend') {
    const tempContainer = document.createElement('div');
    render(itemTemplate, tempContainer);
    container.appendChild(tempContainer.firstElementChild);
  } else {
    render(itemTemplate, container);
  }
}
