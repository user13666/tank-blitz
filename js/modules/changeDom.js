function insertExtensionSettingsTab(tab, setting_container, heder, description, pasteOptionDom = 'beforeend') {
  const settingsGroup = `
  <div  id="${setting_container}">
    <h1>${heder}</h1>
    <p>${description}</p>
    <div class="settings-container"></div>
  </div>`;
  // tab.insertAdjacentHTML(pasteOptionDom, DOMPurify.sanitize(settingsGroup));
  tab.insertAdjacentHTML(pasteOptionDom, settingsGroup);
}

function insertExtensionSetting(dom, setting_n, setting_d, data, name, input_type, pasteOptionDom = 'beforeend') {
  let inputElement = '';
  const { type_name } = input_type;
  if (type_name === 'number') {
    const { step, min, max } = input_type;
    inputElement = `<input class="settings-input settings-input-number" id="${name}" name="${name}" type="number" value="${data[name]}" min="${min}" max="${max}" step="${step}">`;
  } else if (type_name === 'text' || type_name === 'url') {
    const { attribute } = input_type;
    inputElement = `<input class="${name}" id="${name}" name="${name}" type="${type_name}" value="${data[name] ?? ''}" ${attribute}>`;
  } else if (type_name === 'checkbox') {
    const checkedVal = data[name] ? 'checked' : '';
    inputElement = `
    <label class="settings-input input-value-checkbox my-switch">
      <input id="${name}" name="${name}" class="removeOrder" type="checkbox" ${checkedVal}>
      <span class="list-remove"></span>
    </label>`;
  } else if (type_name === 'color') {
    inputElement = `<input class="settings-input settings-input-color" id="${name}" value="${data[name]}" name="${name}" type="color"></input>`;
  } else return;

  const settingBlock = `
  <div class="settings-card">
    <div class="settings-card-body">
      <input class="settings-show-info-checkbox" type="checkbox">
      <div class="settings-info">${setting_d}</div>
      <div class="settings-card-description">
        <span class="settings-card-description-text">${setting_n}</span>
          ${inputElement}
      </div>
    </div>
  </div>`;
  // dom.insertAdjacentHTML(pasteOptionDom, DOMPurify.sanitize(settingBlock));
  dom.insertAdjacentHTML(pasteOptionDom, settingBlock);
}

function selectClan(dom, clanList, pasteOptionDom = 'beforeend') {
  const arrId = clanList.split(', ');
  let optionBlock = '';
  arrId.forEach(clanId => {
    optionBlock += ` <option value="${clanId}">${clanId}</option>`;
  });
  dom.insertAdjacentHTML(pasteOptionDom, optionBlock);
}

function userTableRow(dom, data, tags, pasteOptionDom = 'beforeend') {
  const { account_id, nickname, role, joined_at, statistics, icon, requirement, color } = data;
  const { battles, winRate, avgDamage, last_battle_time } = statistics; // статистика

  const userLang = 'ru';
  const momentLang = moment.locales().includes(userLang) ? userLang : 'en';
  const moment_joined_at = moment(joined_at * 1000)
    .locale(momentLang)
    .fromNow(true);
  const moment_last_battle_time = moment(last_battle_time * 1000)
    .locale(momentLang)
    .fromNow(true);

  let tagsDomBlock = '';
  if (tags.length !== 0) {
    let tagsDom = '';
    tags.forEach(tag => {
      tagsDom += `
        <div class="tags-row">
        <div class="cutout-element cutout-element__left"></div>
          <div class="text">${tag.value}</div>
          <div class="cutout-element cutout-element__right"></div>
        </div>`;
    });
    tagsDomBlock = `
      <li class="extension-responsive-table__row extension-responsive-table-li extension-responsive-table__col-tags" id= "tags-${account_id}" >
        <div class="extension-responsive-table__col extension-item__data extension-item__data-tags">
          ${tagsDom}
        </div>
      </li>`;
  }
  const responsiveTableRow = `
        <div class="extension-responsive-table__item account-rows" id="account_id-${account_id}">
          <li class="extension-responsive-table__row extension-responsive-table-li">
            <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" data-label="Name" style="gap: 10px;">
              <p class="${icon} extension-item__data extension-responsive-table__badge">
                ${role}
              </p>
                <div class="extension-responsive-table__col extension-item__data shadow-wrap badge">
                  <div class="" style="display: flex;justify-content: center;align-items: center;width: 31px;height: 44px;"> 
                    <div class="blob"></div>
                    <p style="display: inline-flex; justify-content: center; align-items: center; position: absolute;"> ${requirement} </p>  
                  </div>
                </div>
              <p style="margin-block-start: 0em; margin-block-end: 0em;">${nickname}</p>
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position"
              data-label="Date">
              <div class=" ">📅 ${moment_joined_at} </div>
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position"
              data-label="Date">
              <div class="">⌛ ${moment_last_battle_time} </div>
              
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position"
              data-label="Date">
              <div class="">⚔️ ${battles}</div>
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min"  data-label="Date">
              <div class="" style="display: flex; justify-content: center; align-items: center;">
                <div class="extension-item__img-border" style ="border-color: ${color};"></div>
                <p style="display: inline-flex; justify-content: center; align-items: center; position: absolute;">%${winRate}</p>
              </div>
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data extension-item__shadow extension-item__shadow-position"
              data-label="Price">
              <div class="">💥 ${avgDamage}</div>
              </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-responsive-table__col_hidden-block extension-item__data">
              <div id="p_chart-${account_id}" class ="mini-chart ">
                <canvas id="points-chart-${account_id}" style="display:none;"></canvas>
              </div>
            </div>

            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data "
              style="margin: 6px 0px;">
              <div style= "padding:0px 5px;">
                Очки <input class="settings-input settings-input-number user-input user-input-min-height user-point" id="point-${account_id}" name="userPoints" type="number" value="${getRandomInt(0, 100)}" min="0" max="" step="1" style="margin: 0px">
              </div>
              <div style= "padding:5px;">
                Кооп <input class="settings-input settings-input-number user-input user-input-min-height user-teamwork" id="teamwork-${account_id}" name="Teamwork" type="number" value="${getRandomInt(0, 200)}" min="0" max="" step="1" style="margin: 0px">
              </div>
            </div>
          </li>
        ${tagsDomBlock}
      </div>`;
  dom.insertAdjacentHTML(pasteOptionDom, DOMPurify.sanitize(responsiveTableRow));
}
function userStatistics(dom, data, pasteOptionDom = 'beforeend') {
  domRemove(document.getElementById('user-statistic'));
  domRemove(document.getElementById('add-block'));
  const { avgDamage, battles, winRate } = data;
  const userStatisticDom = `
  <ul class="extension-responsive-table__sidebar-row" id="user-statistic">
    <li class="extension-responsive-table-li-item" style="margin: 10px 5px;">
      <div class="extension-responsive-table__col extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 34%;">
        <div class="extension-item__shadow extension-item__shadow-position" style="padding: 5%;"> Урон : ${avgDamage} </div>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 34%;">
        <div class="extension-item__shadow extension-item__shadow-position" style="padding: 5%;"> Боёв: ${battles} </div>
      </div>
      <div class="extension-responsive-table__col extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 34%;">
        <div class="extension-item__shadow extension-item__shadow-position" style="padding: 5%;"> Побед: ${winRate}% </div>
      </div>
    </li>
  </ul>
  
  <li class="extension-responsive-table-li-item" id="add-block">
    <div class="extension-responsive-table__col extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 50%;">
      <input class="settings-input settings-input-number user-input user-input-max-height" id="add-user-date"  style="margin: 0px; width: 100%; text-align: center; height: 33px;">
    </div>
    <div class="extension-responsive-table__col extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 50%;">
      <input class="settings-input settings-input-number user-input user-input-max-height"  id="add-user-point" type="number" value="10" min="0" max="" step="1" style="margin: 0px; width: 100%; text-align: center; height: 33px;">
    </div>
    <div class="extension-responsive-table__col extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 50%;">
      <input class="settings-input settings-input-number user-input user-input-max-height"  id="add-user-teamwork"  type="number" value="10" min="0" max="" step="1" style="margin: 0px; width: 100%; text-align: center; height: 33px;">
    </div>
    <a style="float: left; margin: 15px 10px;" id="save-stat">
      <div class="swg-save extension-nav-icon  extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;"></div>
    </a>
  </li>`;

  dom.insertAdjacentHTML(pasteOptionDom, DOMPurify.sanitize(userStatisticDom));
}

function showUserStats(points, dom, pasteOptionDom = 'beforeend') {
  removeAllDom('.point-container');
  let pointsDom = '';
  for (const key in points) {
    // key временная метка
    if (!Object.hasOwn(points, key)) continue;
    const [point, teamwork] = points[key];
    pointsDom += `

      <div class="point-container">
        <!-- Скрытый чекбокс выступает в роли "состояния" (режим редактирования ВКЛ/ВЫКЛ) -->
        <input type="checkbox" id="toggle-edit-${key}" class="state-toggle" hidden>


      <ul class="extension-responsive-table__sidebar-row side-front" id="value-block-${key}" style="display:"">
        <li class="extension-responsive-table-li-item">
          <a style="float: left; margin: 15px 10px;" id="delete-btn-${key}">
            <div class="swg-delete extension-nav-icon  extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;"></div>
          </a>
          <div class="user-stats">
            <p>Дата</p>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" id="user-date-${key}" style="flex-basis: 50%;">
              ${key}
            </div>
          </div>

          <div class="user-stats">
            <p>Очки</p>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" id="user-point-${key}" style="flex-basis: 50%;">
              ${point}
            </div>
          </div>

          <div class="user-stats">
            <p>Кооп</p>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-max market_name" id="user-teamwork-${key}" style="flex-basis: 50%;">
              ${teamwork}
            </div> 
          </div>

            <label for="toggle-edit-${key}">
              <div class="swg-edit extension-nav-icon  extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;" id="edit-btn-${key}"></div>
            </label>
        </li>
      </ul>

      <ul class="extension-responsive-table__sidebar-row side-back">
        <li class="extension-responsive-table-li-item">

          <a style="float: left; margin: 15px 10px;" id="update-btn-${key}">
            <div class="swg-save extension-nav-icon  extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;"></div>
          </a>
          <div class="extension-responsive-table__col extension-responsive-table__col_width-max" style="flex-basis: 50%; margin: 0 0 20px 0px;">
            <p>Дата</p>
            <input class="settings-input settings-input-number user-input user-input-max-height" id="edit-user-date-${key}" style="margin: 0 0.3%;" placeholder="Выбрать дату..." >
          </div>
          <div class="extension-responsive-table__col extension-responsive-table__col_width-max" style="flex-basis: 50%; margin: 0 0 20px 0px;">
            <p>Очки</p>
            <input class="settings-input settings-input-number user-input user-input-max-height" id="edit-user-point-${key}" style="margin: 0 0.3%;" type="number" value="${point}"  min="0" max="" step="1" >
          </div>
          <div class="extension-responsive-table__col extension-responsive-table__col_width-max" style="flex-basis: 50%; margin: 0 0 20px 0px;">
            <p>Кооп</p>
            <input class="settings-input settings-input-number user-input user-input-max-height" id="edit-user-teamwork-${key}" style="margin: 0 0.3%;" type="number" value="${teamwork}"  min="0" max="" step="1" >
          </div>
            <label for="toggle-edit-${key}" class="btn">
              <div class="swg-close extension-nav-icon  extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;"></div>
            </label>
        </li>
      </ul>
    </div> 
`;
  }
  const responsiveTableRow = `
    <ul>             
    
      ${pointsDom}
    </ul> `;
  dom.insertAdjacentHTML(pasteOptionDom, DOMPurify.sanitize(responsiveTableRow));
}

function pointsChart(divItemBlock) {
  domRemove(document.getElementById('p_chart'));
  const historyChartHTML = `
  <div id="p_chart" class ="chart">
    <canvas id="pointsChart"></canvas>
    <div class="chart-navigation">
      <button class="chart-button" id="resetChart">
        Вернуть
      </button>
    </div>
    <div class="chart-navigation">
    </div>
  </div>`;
  divItemBlock.insertAdjacentHTML('beforeend', DOMPurify.sanitize(historyChartHTML));
}

function userRow(dom, data, clansNamesArr, pasteOptionDom = 'beforeend') {
  const { id, name, tags, ex, clanId } = data;
  const { name: clanName = clanId } = clansNamesArr.find(clan => clan.id === clanId) || {};
  let tagsDomBlock = '';
  if (tags.length !== 0) {
    let tagsDom = '';
    tags.forEach(tag => {
      tagsDom += `
        <div class="tags-row">
        <div class="cutout-element cutout-element__left"></div>
          <div class="text">${tag.value}</div>
          <div class="cutout-element cutout-element__right"></div>
        </div>`;
    });
    tagsDomBlock = `
      <li class="extension-responsive-table__row extension-responsive-table-li extension-responsive-table__col-tags" id= "user-tags-${id}" >
        <div class="extension-responsive-table__col extension-item__data extension-item__data-tags">
          ${tagsDom}
        </div>
      </li>`;
  }
  const responsiveTableRow = `
        <div class="extension-responsive-table__item user-data-row" id="account_id-${id}">
          <li class="extension-responsive-table__row extension-responsive-table-li">
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min market_name" 
            data-label="Имя">
              ${name}
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data"
              data-label="Клан">
              ${clanName}
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-item__data"
              data-label="Состоит">
              ${ex ? 'Нет' : 'Да'}
            </div>
            <div class="extension-responsive-table__col extension-responsive-table__col_width-min extension-responsive-table__col_hidden-block extension-item__data"
              data-label="Date">
              <div id="user-p_chart-${id}" class ="mini-chart ">
                <canvas id="user-points-chart-${id}" style="display: none;"></canvas>
              </div>
            </div>
          </li>
        ${tagsDomBlock}
      </div>`;
  dom.insertAdjacentHTML(pasteOptionDom, DOMPurify.sanitize(responsiveTableRow));
}

//! блок добавление настроек

function settingTemplate(itemData, prefix, fieldConfigs) {
  const { id = '' } = itemData;
  // 1. Генератор шаблонов для полей (избавляемся от if-else)
  const templates = {
    color: (val, inputId) => ({
      view: `<div class="extension-responsive-table__sidebar-row extension-responsive-table__col_width-max extension-item__data" style="margin: 0px; flex-basis: 40px;">
                <div class="select-color" style="background-color: ${val};"></div>
            </div>`,
      edit: `<div class="extension-responsive-table__sidebar-row extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 40px; width: 50px;">
                <input class="select-color" id="${inputId}" value="${val}" type="color">
            </div>`,
    }),
    input: (val, inputId, type) => ({
      view: `<div class="user-stats" style="margin: 0px; width: 70%; display: flex;">
                <div class="extension-responsive-table__sidebar-row extension-responsive-table__col_width-max extension-item__data">${val}</div>
              </div>`,
      edit: `<div class="extension-responsive-table__sidebar-row extension-responsive-table__col_width-max extension-item__data" style="flex-basis: 70%;">
              <input class="settings-input settings-input-number user-input user-input-max-height"  id="${inputId}" type="${type}" value="${val || ''}"
                style="margin: 0px; width: 100%; text-align: center; height: 33px;">
            </div>`,
    }),
    picker: (val, inputId) => ({
      view: `<div class="user-stats" style="margin: 0px; width: 60px; display: flex;">
                <img id="img-${inputId}"  class="extension-responsive-table__sidebar-row extension-item__data" style="width: 60px;"></img>
              </div>`,
      edit: `<div id="block-${inputId}"></div>
            <input id="${inputId}" type="text" value="${val || ''}" style="width:0px; height:0px; padding:0px; margin:0px;"></input>`,
    }),
  };

  // 2. Собираем контент за один проход
  return fieldConfigs.reduce(
    (acc, { type, value }) => {
      const inputId = `${prefix}-input-${value}-${id}`;
      const renderer = type === 'text' || type === 'number' ? templates.input : templates[type];

      if (renderer) {
        const html = renderer(itemData[value], inputId, type);
        acc.view += html.view;
        acc.edit += html.edit;
      }
      return acc;
    },
    { view: '', edit: '' },
  );
}
function renderItemBlock(container, descriptionData, insertPosition = 'beforeend') {
  const { prefix, fields, title = '', icon = '', description = '' } = descriptionData;

  const contents = settingTemplate({}, prefix, fields);

  // Вспомогательная функция для генерации сторон (Front/Back) внутри функции
  const renderAdd = (innerHtml, btnType, iconType) => {
    const btnId = `${prefix}-${btnType}-btn`;
    const itemId = `${prefix}-${btnType}-item`;
    return `
      <li class="extension-responsive-table-li" id="${itemId}" style="display: flex!important;">
          ${innerHtml}
        <a style="float: left; margin: 15px 10px;" id="${btnId}">
          <div class="swg-${iconType} extension-nav-icon  extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;"></div>
        </a>
      </li>`;
  };

  // 1. Финальный шаблон
  const itemTemplate = `
    <div class="extension-section">
      <div class="extension-gradient-box">
        <div class="features">
          <details class="extension-feature">
            <summary>
              <i aria-hidden="true" class="check-mark swg-${icon} extension-nav-icon"></i>
              <span class="name">${title}</span>
              <i aria-hidden="true" class="question-icon swg-question extension-nav-icon"></i>
            </summary>
            <div class="answer">${description}</div>
          </details>
        </div>
        ${renderAdd(contents.edit, 'create', 'save')}
        <div id="${prefix}-list" style="overflow: hidden; border-radius: 5px; margin: 0 5px;"> </div>
      </div>
    </div>
`;

  container.insertAdjacentHTML(insertPosition, DOMPurify.sanitize(itemTemplate));
}

function renderItemList(container, itemData, prefix, fieldConfigs, insertPosition = 'beforeend') {
  const { id } = itemData;
  const toggleId = `${prefix}-toggle-edit-${id}`;

  const contents = settingTemplate(itemData, prefix, fieldConfigs);

  // Вспомогательная функция для генерации сторон (Front/Back) внутри функции
  const renderSide = (side, innerHtml, btnType, iconType, extraAttr = '') => {
    const btnId = `${prefix}-${btnType}-btn-${id}`;
    return `
      <ul class="extension-responsive-table__sidebar-row side-${side}" ${side === 'front' ? `id="${prefix}-block-${id}"` : ''}>
        <li class="extension-responsive-table-li-item">
          <a style="float: left; margin: 15px 10px;" id="${btnId}">
            <div class="swg-${btnType === 'update' ? 'save' : btnType} extension-nav-icon extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;"></div>
          </a>
          ${innerHtml}
          <label for="${toggleId}" ${extraAttr}>
            <div class="swg-${iconType} extension-nav-icon extension-nav-icon_min extension-nav-icon_menu" style="margin: 0px 12px;"></div>
          </label>
        </li>
      </ul>`;
  };

  // 1. Финальный шаблон
  const itemTemplate = `
    <li style="margin:4px 2px; border-radius: 5px; overflow: visible;">
      <div class="settings-list">
        <input type="checkbox" id="${toggleId}" class="state-toggle" hidden="">
        ${renderSide('front', contents.view, 'delete', 'edit', `id="edit-btn-tag-${id}"`)}
        ${renderSide('back', contents.edit, 'update', 'close')}
      </div>
    </li>`;

  container.insertAdjacentHTML(insertPosition, DOMPurify.sanitize(itemTemplate));
}
