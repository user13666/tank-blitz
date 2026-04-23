/* eslint-disable import/extensions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */

import {
  selectClan,
  userTableRow,
  userStatistics,
  showUserStats,
  pointsChart,
  userRow,
  renderItemBlock,
  renderItemList,
} from '../../modules/changeDom.js';

import displayPagination from './pagination.js';

// Единый объект для управления всеми БД
const AppDB = {
  clans: new Dexie('clansDb'),
  users: new Dexie('UsersDb'),
  settings: new Dexie('settingsDb'),

  init() {
    this.clans.version(1).stores({
      clans: 'id, data, timestamp',
      clansData: 'id, name',
    });

    this.users.version(1).stores({
      users: 'id, [clanId+ex], *tagValues',
    });

    this.settings.version(1).stores({
      tags: '++id',
      winrate: '++id',
      roles: '++id',
    });

    return this; // Для цепочного вызова
  },
};

//! преобразовывать массив пользователи в объект
async function getClanData(data) {
  await PauseBetweenOperations(4000, 500);
  const { members } = GlobalDataJson;
  const paramsObject = Object.fromEntries(members.map(item => [item.account_id, item]));
  GlobalDataJson.members = paramsObject;
  return GlobalDataJson;
}
chrome.storage.local.get(
  [
    'delaysServerRequest',
    'delaysStorageRequest',
    'delaysErrorMinute',
    'clanList',
    'workloadOneDay',
    'workloadTwoDay',
    'workloadThreeDay',
    'workloadFourDay',
    'workloadFiveDay',
    'workloadSixDay',
    'workloadSevenDay',
  ],
  async data => {
    const selectClanDom = document.querySelector('#selectClanBlock');
    selectClan(selectClanDom, data.clanList || '', 'beforeend');
    const extensionSettings = { ...data };
    extensionSettings.CountRequests = 5;
    try {
      run(extensionSettings);
    } catch (err) {
      if (err.name === 'QuotaExceededError' || (err.inner && err.inner.name === 'QuotaExceededError')) {
        document.querySelector('#execution_log').textContent = 'Not enough memory';
      } else {
        console.log('Run error', err);
        setProgress(0);
      }
    }
  },
);
//! !кликаем по списку пользователей делегирование событий один обработчик для всех
async function showUserData(extensionSettings) {
  // Находим таблицу один раз
  const memberList = document.querySelector('#table-users .extension-responsive-table');

  // Вешаем клик на всю таблицу
  memberList.addEventListener('click', async event => {
    // Проверяем, что кликнули по строке (или внутри строки) с id аккаунта
    // «Найти среди предков того элемента, по которому кликнули, самый близкий элемент, чей id начинается на account_id-».
    const accountDom = event.target.closest('[id^="account_id-"]');
    if (!accountDom || !accountDom.dataset.userdata) return;

    const userblock = document.getElementById('user-panel');
    const accountStatistic = document.getElementById('account-statistic');
    const accountName = document.getElementById('account-name');

    const { userData } = JSON.parse(accountDom.dataset.userdata);
    const { account_id, requirement, nickname, statistics } = userData;

    // Логика обработки
    userblock.dataset.account_id = account_id;

    // Запускаем параллельно, чтобы не ждать по очереди
    await Promise.all([showTags(extensionSettings), showSelectedPoints(requirement)]);

    accountName.textContent = nickname;
    userStatistics(accountStatistic, statistics);
    addUserStat(requirement);
  });
}

function showPicker(item, fields, prefix, showImg = false) {
  const { id = '', icon = '' } = item;
  const hasPicker = fields.find(it => it.type === 'picker');
  if (!hasPicker) return;
  handlerPicker({
    pickerId: `block-${prefix}-input-${hasPicker.value}-${id}`,
    inputId: `${prefix}-input-${hasPicker.value}-${id}`,
    icon,
  });
  if (!showImg) return;
  const imgUrl = chrome.runtime.getURL(`${icon}`);
  const img = document.querySelector(`#img-${prefix}-input-${hasPicker.value}-${id}`);
  if (img) img.src = imgUrl;
}

async function handleTagAction() {
  const memberList = document.querySelector('#control-panel');
  if (!memberList) return;
  const tagFields = [
    { type: 'text', value: 'value' },
    { type: 'color', value: 'color' },
  ];

  const winrateFields = [
    { type: 'number', value: 'value' },
    { type: 'color', value: 'color' },
  ];

  const rolesFields = [
    { type: 'text', value: 'name' },
    { type: 'number', value: 'limit' },
    { type: 'picker', value: 'icon' },
  ];

  // Словарь действий: сопоставляем тип кнопки с функцией
  const actions = {
    'tag-delete': id => deleteItem('settings', 'tags', 'tag', id),
    'tag-update': id => updateItem('settings', 'tags', 'tag', id, tagFields),
    'tag-create': () => createItem('settings', 'tags', 'tag', tagFields),
    'winrate-delete': id => deleteItem('settings', 'winrate', 'winrate', id, winrateFields),
    'winrate-update': id => updateItem('settings', 'winrate', 'winrate', id, winrateFields),
    'winrate-create': () => createItem('settings', 'winrate', 'winrate', winrateFields),
    'roles-delete': id => deleteItem('settings', 'roles', 'roles', id, rolesFields),
    'roles-update': id => updateItem('settings', 'roles', 'roles', id, rolesFields),
    'roles-create': () => createItem('settings', 'roles', 'roles', rolesFields),
  };

  const blockFieldsSettings = [
    {
      prefix: 'tag',
      fields: tagFields,
      title: 'Теги',
      description: 'Здесь редактируются теги. Если тегов нет добавляются значения по умолчанию',
      icon: 'tags',
    },
    {
      prefix: 'winrate',
      fields: winrateFields,
      title: 'Цвета % побед',
      description: 'Здесь задается цвет в зависимости какой процент побед.',
      icon: 'winrate',
    },
    {
      prefix: 'roles',
      fields: rolesFields,
      title: 'Цвета % побед',
      description: 'Здесь задается цвет в зависимости какой процент побед.',
      icon: 'winrate',
    },
  ];
  const listBlock = document.getElementById(`control-panel`);
  blockFieldsSettings.forEach(item => {
    renderItemBlock(listBlock, item);
    const { prefix, fields } = item;
    showPicker({}, fields, prefix);
  });

  const withoutId = ['tag-create', 'winrate-create', 'roles-create'];
  const crud = asyncProtectClick(async event => {
    const btn = event.target.closest('[id*="-btn"]');
    if (!btn) return;

    // Извлекаем тип действия (delete, update или create) из ID кнопки
    const actionType = btn.id.replace(/-btn(-\d+)?$/, ''); // tag-create
    const action = actions[actionType];
    if (!action) return;

    const id = parseInt(btn.dataset.item_id, 10);
    if (Number.isNaN(id) && !withoutId.includes(actionType)) return;
    await action(id).catch(console.error);
  }, 1000);

  memberList.addEventListener('click', crud);
}

async function run(extensionSettings) {
  AppDB.init();

  await searchByTags();

  const select = document.getElementById('selectClan');
  const update = async val => (+val ? await runLoadClanMembers(+val, extensionSettings) : null);
  // Инициализация
  if (select?.value) await update(select.value);
  // Слушатель
  select?.addEventListener('change', e => update(e.target.value));

  await showUserData(extensionSettings);
  handleItemTag();
  handleItemWinrate();
  handleTagAction();
  handleTags();
}

// ----- создание тегов

async function handleItemTag() {
  const defaultTags = [
    { id: 1, value: 'Нарушил правило', color: '#ff0000' },
    { id: 2, value: 'Исключен', color: '#ffa500' },
    { id: 3, value: 'Не выгонять', color: '#ffff00' },
    { id: 4, value: 'Предупреждён', color: '#008000' },
    { id: 5, value: 'Не выполнил кз', color: '#00bfff' },
    { id: 6, value: 'Не приглашать', color: '#0000ff' },
    { id: 7, value: 'Неизвестно', color: '#ee82ee' },
  ];

  const tagFields = [
    { type: 'text', value: 'value' },
    { type: 'color', value: 'color' },
  ];

  await refreshData('settings', 'tags', 'tag', tagFields, defaultTags);
}

async function handleTags() {
  const defaultRoles = [
    { id: 1, name: 'звание1', limit: '1', icon: 'images/png/select/1.jpg' },
    { id: 2, name: 'звание2', limit: '2', icon: 'images/png/select/2.jpg' },
    { id: 3, name: 'звание3', limit: '3', icon: 'images/png/select/3.jpg' },
    { id: 4, name: 'звание4', limit: '4', icon: 'images/png/select/4.jpg' },
    { id: 5, name: 'звание5', limit: '5', icon: 'images/png/select/5.jpg' },
  ];
  const rolesFields = [
    { type: 'text', value: 'name' },
    { type: 'number', value: 'limit' },
    { type: 'picker', value: 'icon' },
  ];
  await refreshData('settings', 'roles', 'roles', rolesFields, defaultRoles);
}

async function handleItemWinrate() {
  const defaultTags = [
    { id: 1, value: '70', color: '#00435f' },
    { id: 2, value: '60', color: '#005f4b' },
    { id: 3, value: '55', color: '#616161' },
    { id: 4, value: '50', color: '#5f5f00' },
    { id: 5, value: '0', color: '#ff0000' },
  ];

  const winrateFields = [
    { type: 'number', value: 'value' },
    { type: 'color', value: 'color' },
  ];
  await refreshData('settings', 'winrate', 'winrate', winrateFields, defaultTags);
}

// Универсальная отрисовка и загрузка
async function refreshData(dbName, tableName, prefix, fields, defaultData = []) {
  removeAllDom(`#${prefix}-list li`);

  let items = await AppDB[dbName][tableName].toArray();

  // Если пусто — заполняем дефолтными значениями
  if (items.length === 0 && defaultData.length > 0) {
    await AppDB[dbName][tableName].bulkPut(defaultData);
    items = defaultData;
  }

  const listDom = document.getElementById(`${prefix}-list`);
  if (!listDom) return;

  for (const item of items) {
    const { id, icon } = item;
    renderItemList(listDom, item, prefix, fields); // renderItem тоже должна принимать prefix
    showPicker(item, fields, prefix, true);
    // Находим кнопки по универсальным ID
    const deleteBtn = document.getElementById(`${prefix}-delete-btn-${id}`);
    const saveBtn = document.getElementById(`${prefix}-update-btn-${id}`);
    if (deleteBtn) deleteBtn.dataset.item_id = id;
    if (saveBtn) saveBtn.dataset.item_id = id;
  }
}

function collectData(prefix, id = '', fields = []) {
  const data = {};
  fields.forEach(field => {
    const { type, value } = field;
    const el = document.getElementById(`${prefix}-input-${value}-${id}`);
    if (el) data[value] = el.type === 'number' ? Number(el.value) : el.value.trim();
  });
  // Проверка: если хоть одно поле пустое (кроме чисел 0), считаем невалидным
  const isValid = Object.values(data).every(val => val !== '' && val !== undefined);
  return isValid ? data : null;
}

// Универсальное обновление
async function updateItem(dbName, tableName, prefix, id, fields) {
  const data = collectData(prefix, id, fields);
  if (!data) return;

  await AppDB[dbName][tableName].update(Number(id), data);
  await refreshData(dbName, tableName, prefix, fields);
}

// Универсальное удаление
async function deleteItem(dbName, tableName, prefix, id, fields) {
  await AppDB[dbName][tableName].delete(Number(id));
  await refreshData(dbName, tableName, prefix, fields);
}

// Универсальное создание
async function createItem(dbName, tableName, prefix, fields) {
  const data = collectData(prefix, '', fields);
  if (!data) return;

  await AppDB[dbName][tableName].add(data);
  await refreshData(dbName, tableName, prefix, fields);
}

// Утилита для обновления прогресса
function setProgress(width) {
  const progressLine = document.querySelector('.extension-bar');
  if (progressLine) progressLine.style.width = `${width}%`;
}

async function runLoadClanMembers(clanId, extensionSettings) {
  const loadButton = document.getElementById('loadUsers');

  setProgress(0);
  const clanData = await AppDB.clans.clans.get(clanId);

  // Логика кнопки "Загрузить" (обновление данных)
  const load = asyncProtectClick(async () => {
    setProgress(10);
    const oldClanData = await AppDB.clans.clans.get(clanId);

    const clanMembers = await getClanData(extensionSettings);
    if (!clanMembers) {
      removeAllDom('.extension-responsive-table__item');
      setProgress(100);
      return;
    }

    setProgress(30);
    const timestamp = Date.now();
    await AppDB.clans.clans.put({ id: clanId, data: clanMembers, timestamp });

    // Используем put вместо add, чтобы не ловить ошибку "уже существует"
    await AppDB.clans.clansData.put({
      id: clanId,
      name: clanMembers.name,
      weekly_points: oldClanData?.weekly_points || [],
    });

    setProgress(50);
    await addUser(clanMembers.members, clanId).catch(() => console.log('Часть данных сохранена'));

    await showUsers(clanMembers.members, extensionSettings);

    if (oldClanData?.data?.members) {
      await extUsersAdd(clanMembers.members, oldClanData.data.members, AppDB);
    }

    setProgress(100);
  }, 1000);

  loadButton.onclick = load;

  // Первоначальное отображение (из кэша БД)
  if (!clanData) {
    removeAllDom('.extension-responsive-table__item');
    setProgress(100);
    return;
  }

  await showUsers(clanData.data.members, extensionSettings);

  setProgress(100);
}

function setTagColor(tags, selector, dom) {
  if (dom) {
    const listTagsDom = dom.querySelectorAll(selector); // .tags-row
    listTagsDom.forEach(TagDom => {
      const tagsValue = TagDom.querySelector('.text').textContent;
      const tagObj = tags.find(item => item.value === tagsValue);
      TagDom.style.setProperty('--c-white', tagObj.color);
    });
  }
}

async function showUsers(members, extensionSettings) {
  if (!members) return;

  const memberList = document.querySelector('#table-users .extension-responsive-table');
  removeAllDom('.extension-responsive-table__item');

  const membersArray = Object.values(members);
  const usersIdArr = membersArray.map(memberData => memberData.account_id);

  // 1. Предзагрузка всех данных из БД одной пачкой (ускоряет работу в разы)
  const dbDataMap = new Map();
  await Promise.all(
    membersArray.map(async m => {
      const data = await AppDB.users.users.get(m.account_id);
      dbDataMap.set(m.account_id, data || {});
    }),
  );

  // 2. Быстрая отрисовка без ожидания внутри цикла
  for (const memberData of membersArray) {
    const { account_id } = memberData;
    const userData = await addAdditionalInformation(memberData, extensionSettings);
    userData.color = await getColor(memberData?.statistics.winRate);

    const { tags = [], stats = {} } = dbDataMap.get(account_id);

    // Создаем строку таблицы
    userTableRow(memberList, userData, tags);

    // 2. Ищем элементы ТОЛЬКО внутри свежесозданной строки или по уникальному ID
    const currentRow = document.getElementById(`account_id-${account_id}`);
    if (!currentRow) continue;

    // Настройка мини-графика
    if (isNotEmptyObj(stats)) {
      const chartDom = currentRow.querySelector(`#points-chart-${account_id}`);
      if (chartDom) {
        chartDom.style.display = '';
        showMyPointsMiniChart(stats, `points-chart-${account_id}`);
      }
    }

    // Настройка тегов
    const userTagsDom = document.getElementById(`tags-${account_id}`);
    setTagColor(tags, '.tags-row', userTagsDom);

    currentRow.dataset.userdata = JSON.stringify({ userData });
    // Больше никакой привязки .onclick внутри цикла!
  }
  const nameBlock = document.querySelector('#table-users p.extension-responsive-table__col.extension-responsive-table__col_width-max');
  sortingName(nameBlock);
  addUserDate(); // отобразить элемент даты
  await savePointsUsers(usersIdArr, members, extensionSettings);
  await selectStorageUsers();
}

async function addAdditionalInformation(memberData, extensionSettings) {
  const { role, joined_at } = memberData;
  const daysKeys = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
  // 1. Создаем чистый массив из 7 дней без дублей
  const workloadDays = daysKeys.map(key => extensionSettings[`workload${key}Day`]);
  const diffInDays = getDiffDate(joined_at, 'days');
  // 2. Логика требований: если индекс больше 6, берем последний (7-й) день
  const requirement = workloadDays[Math.min(diffInDays, 6)];
  const { userRole, userIcon } = await getMemberRole(joined_at);
  const GLOBAL_ROLES = [
    { type: 'private', role: userRole, icon: userIcon, requirement },
    { type: 'executive_officer', role: 'Офицер', icon: 'images/png/clan/moderator.png', requirement },
    { type: 'commander', role: 'Глава', icon: 'images/png/clan/founder.png', requirement },
  ];
  // 3. Находим роль или используем объект 'private' по умолчанию
  const roleObj = GLOBAL_ROLES.find(r => r.type === role) || GLOBAL_ROLES[0];

  return { ...memberData, ...roleObj };
}

async function getMemberRole(joined_at) {
  const diffInMonths = getDiffDate(joined_at, 'months');
  // Определяем пороги в порядке убывания
  const rolesArr = await AppDB.settings.roles.toArray();
  const ROLES = rolesArr.sort((first, second) => second.limit - first.limit);
  // Находим первую роль, под условие которой подходит diffInMonths
  const role = ROLES.find(r => diffInMonths > r.limit) || ROLES[ROLES.length - 1];
  return { userRole: role.name, userIcon: role.icon };
}

function getDiffDate(date, time) {
  const today = moment();
  const momentDate = moment(date * 1000);
  const diffInTime = today.diff(momentDate, time);
  return diffInTime;
}

async function getColor(percent) {
  const thresholds = await AppDB.settings.winrate.toArray();

  const found = thresholds.find(t => percent >= +t.value || 0);
  return found ? found.color : '#652f2f';
}

// обновляем статус если есть
async function addUser(clanMembers, clanId) {
  const membersArr = Object.values(clanMembers);
  const membersIdArr = membersArr.map(m => m.account_id);

  if (membersIdArr.length === 0) return;
  // 1. Получаем существующие данные из БД
  const oldUsers = await AppDB.users.users.bulkGet(membersIdArr);
  // 2. Формируем итоговый массив
  const usersToSave = membersArr.map((member, index) => {
    const existingUser = oldUsers[index];
    // Если юзер есть: берем старые данные и сбрасываем ex: 0
    if (existingUser) return { ...existingUser, name: member.nickname, clanId, ex: 0 };
    // Если юзера нет: создаем новый объект с дефолтными значениями
    return { id: member.account_id, name: member.nickname, tags: [], tagValues: [], stats: {}, clanId, ex: 0 };
  });
  // 3. Сохраняем всё одним махом
  await AppDB.users.users.bulkPut(usersToSave);
}

async function extUsersAdd(newMembers, oldMembers) {
  const newMembersSet = new Set(Object.keys(newMembers));
  const extMembers = Object.values(oldMembers).filter(data => !newMembersSet.has(`${data.account_id}`));
  const extMembersArr = extMembers.map(member => member.account_id);
  if (extMembersArr.length === 0) return;
  // await AppDB.users.users.bulkUpdate(extMembersArr.map(id => ({ key: id, changes: { ex: 1 } })));
  await AppDB.users.users.where('id').anyOf(extMembersArr).modify({ ex: 1 });
}

// теги выбранного пользователя по умолчанию скрыт
async function showTags(extensionSettings) {
  const whitelist = await AppDB.settings.tags.toArray();
  const userTags = document.querySelector('input[name=member]');
  userTags.style.display = '';
  const userBlock = document.getElementById('user-panel');
  const saveTagsBlock = document.getElementById('saveTags');
  saveTagsBlock.style.display = '';
  const { account_id } = userBlock.dataset;
  const isTagify = userTags.__tagify;
  if (isTagify) isTagify.destroy(); // Полностью удаляет экземпляр

  const tagifyUserTags = new Tagify(userTags, {
    whitelist,
    userInput: false,

    templates: {
      tag(tagData) {
        return `
                <tag title="${tagData.title || tagData.value}"
                    contenteditable='false'
                    spellcheck='false'
                    tabIndex="-1"
                    class="${this.settings.classNames.tag} ${tagData.class ? tagData.class : ''}"
                    ${this.getAttributes(tagData)}>
                    <x title='' class='tagify__tag__removeBtn' role='button' aria-label='remove tag'></x>
                    <div>
                        <!-- Элемент круга -->
                        <span class='tag-circle extension-item__shadow' style='background: ${tagData.color || '#000'}'></span>
                        <span class='tagify__tag-text'>${tagData.value}</span>
                    </div>
                </tag>
            `;
      },
    },
  });
  tagifyUserTags.removeAllTags();
  const { tags } = (await AppDB.users.users.get(+account_id)) ?? {};
  if (!tags) return;
  tagifyUserTags.addTags(tags);

  const saveTags = asyncProtectClick(async () => {
    const clanId = Number(document.getElementById('selectClan')?.value);
    if (!clanId && clanId !== 0) return;
    const clanData = await AppDB.clans.clans.get(clanId);
    const userBlock = document.getElementById('user-panel');
    const { account_id } = userBlock.dataset;
    const member = await AppDB.users.users.get(+account_id);
    if (!member) return;

    const tags = tagifyUserTags.value.map(item => ({ value: item.value, id: item.id, color: item.color }));
    const tagValues = tagifyUserTags.value.map(item => item.value);
    await AppDB.users.users.update(+account_id, { tags, tagValues });

    await showUsers(clanData.data.members, extensionSettings);
  }, 1000);
  saveTagsBlock.addEventListener('click', saveTags);
}

function sortingName(currentDom) {
  const arrows = { asc: '🡹', desc: '🡻' };
  const baseText = currentDom.innerText.replace(/[🡹🡻]/gu, '').trim();

  currentDom.onclick = () => {
    // Определяем текущий порядок: если был asc -> делаем desc, иначе -> asc
    const isAsc = currentDom.dataset.order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';

    // Обновляем состояние и текст
    currentDom.dataset.order = newOrder;
    currentDom.innerText = `${baseText} ${arrows[newOrder]}`;

    // Вызываем сортировку (передаем true если asc)
    sortingDomObject(newOrder === 'asc');
  };
}

function sortingDomObject(asc) {
  const container = document.querySelector('#table-users .extension-responsive-table.list');
  const items = Array.from(container.querySelectorAll('.extension-responsive-table__item'));
  // Кешируем имена, чтобы не парсить JSON постоянно
  const mapped = items.map(el => ({
    el,
    name: JSON.parse(el.dataset.userdata || '{}').userData?.nickname?.toLowerCase() || '',
  }));
  mapped.sort((first, second) => (asc ? first.name.localeCompare(second.name) : second.name.localeCompare(first.name)));
  // Перерисовываем DOM (DocumentFragment ускоряет вставку)
  const fragment = document.createDocumentFragment();
  mapped.forEach(item => fragment.appendChild(item.el));
  container.appendChild(fragment);
}
// ------------------ очки пользователя
async function addUserDate() {
  const userDate = document.getElementById('userDate');
  userDate.style.display = '';
  flatpickr(userDate, { enableTime: false, dateFormat: 'Y-m-d' });
}

async function savePointsUsers(usersIdArr, members, extensionSettings) {
  const savePointsBlock = document.getElementById('savePoints');

  const savePoints = asyncProtectClick(async () => {
    setProgress(0);

    const usersPoints = document.querySelectorAll('.user-point');
    const usersTeamworks = document.querySelectorAll('.user-teamwork');

    const userDate = document.getElementById('userDate');
    const userDateStr = userDate.value;
    if (!userDateStr) return;
    if (!checkNumInputs(usersPoints)) return;
    if (!checkNumInputs(usersTeamworks)) return;
    if (usersIdArr?.length === 0) return;

    const updatesFromUI = usersIdArr.map(id => {
      const point = Number(document.getElementById(`point-${id}`)?.value ?? '0');
      const teamwork = Number(document.getElementById(`teamwork-${id}`)?.value ?? '0');
      return { id, point, teamwork };
    });

    await AppDB.users.transaction('rw', AppDB.users.users, async () => {
      // Получаем текущие данные для этих ID
      const users = await AppDB.users.users.bulkGet(updatesFromUI.map(u => u.id));
      // Формируем массив обновлений
      const bulkUpdateData = users
        .filter(user => user !== undefined)
        .map(user => {
          // Берем подготовленные данные по ID
          const uiData = updatesFromUI.find(u => u.id === user.id);
          const pointsObj = { [userDateStr]: [uiData.point || 0, uiData.teamwork || 0], ...user.stats };
          return { key: user.id, changes: { stats: sortObj(pointsObj) } };
        });

      if (bulkUpdateData.length > 0) await AppDB.users.users.bulkUpdate(bulkUpdateData);
    });
    setProgress(30);
    await showUsers(members, extensionSettings);
    setProgress(65);
    //! если выбран пользователь обновляем выбранного пользователя
    const userblock = document.getElementById('user-panel');
    const { account_id } = userblock?.dataset || {};
    if (!account_id) return;
    const accountDom = document.getElementById(`account_id-${account_id}`);
    const { userData } = JSON.parse(accountDom?.dataset?.userdata || '{}');
    if (!userData) return;
    const { requirement } = userData;
    await showSelectedPoints(requirement);
    setProgress(100);
  }, 1000);

  savePointsBlock.onclick = savePoints;
}

function editPoints(stats, requirement) {
  for (const key in stats) {
    if (!Object.hasOwn(stats, key)) continue;
    const userDate = document.getElementById(`edit-user-date-${key}`);
    const dateVal = document.getElementById(`user-date-${key}`).textContent.trim() || moment().format('YYYY-MM-DD');
    flatpickr(userDate, { enableTime: false, dateFormat: 'Y-m-d', defaultDate: dateVal });

    const deleteButton = document.querySelector(`#delete-btn-${key}`);
    const updateButton = document.querySelector(`#update-btn-${key}`);
    deleteButton.dataset.dateStr = `${key}`;
    updateButton.dataset.dateStr = `${key}`;

    const deletePoints = asyncProtectClick(async function () {
      setProgress(0);

      document.querySelector('.stats-pagination')?.replaceChildren();
      document.querySelector('#account-point')?.replaceChildren();
      const { dateStr } = this.dataset;
      const userBlock = document.getElementById('user-panel');
      const accountId = +userBlock.dataset.account_id;

      let { stats } = (await AppDB.users.users.get(accountId)) ?? {};
      if (!stats) return;

      const { [dateStr]: _, ...updStats } = stats; // присваиваем ему короткое-то имя _
      stats = updStats;
      await AppDB.users.users.update(accountId, { stats });
      await showSelectedPoints(requirement);
      setProgress(100);
    }, 1000);

    deleteButton.onclick = deletePoints;

    const updatePoints = asyncProtectClick(async function () {
      setProgress(0);

      const { dateStr } = this.dataset; // Старый ключ
      const userBlock = document.getElementById('user-panel');
      const accountId = +userBlock.dataset.account_id;

      // 1. Собираем элементы один раз
      const elDate = document.getElementById(`edit-user-date-${dateStr}`);
      const elPoint = document.getElementById(`edit-user-point-${dateStr}`);
      const elTeam = document.getElementById(`edit-user-teamwork-${dateStr}`);
      const elOldDate = document.getElementById(`user-date-${dateStr}`);

      // 2. Получаем текущие значения
      const newDateStr = elDate.value;
      const oldDateStr = elOldDate.textContent;
      const statArr = [elPoint.value, elTeam.value];

      if (newDateStr === oldDateStr && elPoint.defaultValue === statArr[0] && elTeam.defaultValue === statArr[1]) return;

      let { stats } = (await AppDB.users.users.get(accountId)) ?? {};
      if (!stats) return;

      // 5. Логика обновления: если дата изменилась — удаляем старый ключ, создаем новый
      if (newDateStr !== oldDateStr) {
        const { [dateStr]: _, ...updStats } = stats; // присваиваем ему короткое-то имя _
        stats = updStats;
      }

      // В любом случае записываем актуальные значения по (новому или старому) ключу
      stats[newDateStr] = statArr;
      const sortedStats = sortObj(stats);
      await AppDB.users.users.update(accountId, { stats: sortedStats });

      await showSelectedPoints(requirement);
      setProgress(100);
    }, 1000);

    updateButton.onclick = updatePoints;
  }
}

async function addUserStat(requirement) {
  const userBlock = document.getElementById('user-panel');
  const accountId = +userBlock.dataset.account_id;
  const eDate = document.getElementById('add-user-date');
  const date = flatpickr(eDate, {
    enableTime: false,
    dateFormat: 'Y-m-d',
    defaultDate: Date.now(),
  });
  const addButton = document.getElementById('save-stat');

  const addStat = asyncProtectClick(async () => {
    setProgress(0);

    const dateStr = date.formatDate(date.selectedDates[0], 'Y-m-d');
    const elUserPoint = Number(document.getElementById(`add-user-point`)?.value ?? '0');
    const elUserTeamwork = Number(document.getElementById(`add-user-teamwork`)?.value ?? '0');

    const { stats } = (await AppDB.users.users.get(accountId)) ?? {};
    if (!stats) return;
    const statsObj = { [dateStr]: [elUserPoint || 0, elUserTeamwork || 0], ...stats };
    const sortStatsObj = sortObj(statsObj);
    await AppDB.users.users.update(accountId, { stats: sortStatsObj });
    await showSelectedPoints(requirement);

    setProgress(100);
  }, 1000);

  addButton.onclick = addStat;
}

// пагинация

async function showSelectedPoints(requirement) {
  const userBlock = document.getElementById('user-panel');
  const { account_id } = userBlock.dataset;
  const { stats } = (await AppDB.users.users.get(+account_id)) ?? {};
  if (!stats) return;
  if (!isNotEmptyObj(stats)) return;
  // eslint-disable-next-line prefer-const
  let numberOfRecordsFn = async () => Object.keys(stats).length;

  const entries = Object.entries(stats);
  // eslint-disable-next-line prefer-const
  let itemPageFn = async (startIndex, pageSize) => Object.fromEntries(entries.slice(startIndex, startIndex + pageSize));

  const displayDataFn = stats => {
    const pointsBlock = document.getElementById('account-point');
    showUserStats(stats, pointsBlock);
    editPoints(stats, requirement);
    const chartBlock = document.querySelector('.stats-chart');
    pointsChart(chartBlock);
    showMyPointsChart(stats, requirement);
  };

  await displayPagination({
    numberOfRecordsFn,
    itemPageFn,
    displayDataFn,
    selector: '.stats-pagination',
    currentPage: 1,
    startPage: 1,
    pageSize: 20,
    maxPages: 5,
  });
}

//--------------------
// ------------------ Отображение всех участников вкладка поиск

async function displayUsersData(usersArr) {
  removeAllDom('.user-data-row');
  const clans = (await AppDB.clans.clansData.toArray()) ?? {};
  const clansNamesArr = clans.map(c => c.name);
  const tableBlock = document.querySelector('#all-users .extension-responsive-table');
  if (usersArr.length === 0) return;
  usersArr.forEach(user => {
    userRow(tableBlock, user, clansNamesArr);
    const { id, stats, tags } = user;
    const userTags = document.getElementById(`user-tags-${id}`);
    setTagColor(tags, '.tags-row', userTags);
    if (!isNotEmptyObj(stats)) return;
    const chartDom = document.getElementById(`user-points-chart-${id}`);
    if (chartDom) {
      chartDom.style.display = '';
      showMyPointsMiniChart(stats, `user-points-chart-${id}`);
    }
  });
}
// Использование объекта-словаря
function handleUserViewRequest(type) {
  removeAllDom('.user-data-row');
  const viewMap = {
    all: showAllUsers,
    'in-clan': showUsersInClan,
    'not-in-clan': showUsersNotInClan,
  };
  const executeView = viewMap[type];
  if (!executeView) return;
  executeView();
}

async function selectStorageUsers() {
  const usersRadioBlock = document.querySelector('#users-radio');
  if (!usersRadioBlock) return;
  const defaultValue = usersRadioBlock.querySelector('input[name="option"]:checked')?.value ?? 'all';
  handleUserViewRequest(defaultValue);
  usersRadioBlock.addEventListener('change', event => {
    if (!event.target.name === 'option') return;
    const selectValue = event.target.value;
    handleUserViewRequest(selectValue);
  });
}

async function showAllUsers() {
  const numberOfRecordsFn = async () => AppDB.users.users.count();
  const itemPageFn = async (startIndex, pageSize) => AppDB.users.users.offset(startIndex).limit(pageSize).toArray();
  const displayDataFn = usersArr => {
    displayUsersData(usersArr);
  };

  await displayPagination({
    numberOfRecordsFn,
    itemPageFn,
    displayDataFn,
    selector: '#all-users .extension-pagination',
    currentPage: 1,
    startPage: 1,
    pageSize: 20,
    maxPages: 5,
  });
}

async function showUsersInClan() {
  const clanId = Number(document.getElementById('selectClan')?.value);
  if (!clanId && clanId !== 0) return;
  numberOfRecordsFn = async () => AppDB.users.users.where('[clanId+ex]').equals([clanId, 0]).count();
  itemPageFn = async (startIndex, pageSize) =>
    AppDB.users.users
      .where('[clanId+ex]')
      .equals([clanId, 0]) // поиск сразу по двум критериям
      .offset(startIndex)
      .limit(pageSize)
      .toArray();
  const displayDataFn = usersArr => {
    displayUsersData(usersArr);
  };

  await displayPagination({
    numberOfRecordsFn,
    itemPageFn,
    displayDataFn,
    selector: '#all-users .extension-pagination',
    currentPage: 1,
    startPage: 1,
    pageSize: 20,
    maxPages: 5,
  });
}

async function showUsersNotInClan() {
  const clanId = Number(document.getElementById('selectClan')?.value);
  if (!clanId && clanId !== 0) return;
  numberOfRecordsFn = async () => AppDB.users.users.where('[clanId+ex]').equals([clanId, 1]).count();
  itemPageFn = async (startIndex, pageSize) =>
    AppDB.users.users
      .where('[clanId+ex]')
      .equals([clanId, 1]) // поиск сразу по двум критериям
      .offset(startIndex)
      .limit(pageSize)
      .toArray();
  const displayDataFn = usersArr => {
    displayUsersData(usersArr);
  };

  await displayPagination({
    numberOfRecordsFn,
    itemPageFn,
    displayDataFn,
    selector: '#all-users .extension-pagination',
    currentPage: 1,
    startPage: 1,
    pageSize: 20,
    maxPages: 5,
  });
}

// поиск по тегам

function handleViewTags(type, searchTags) {
  const viewMap = {
    all: findUsersByTags,
    'in-clan': findUsersByTagsInClan,
    'not-in-clan': findUsersByTagsNotInClan,
  };
  const executeView = viewMap[type];
  if (!executeView) return;
  executeView(searchTags);
}

async function findUsersByTags(searchTags) {
  numberOfRecordsFn = async () => AppDB.users.users.where('tagValues').anyOf(searchTags).distinct().count();
  itemPageFn = async (startIndex, pageSize) =>
    AppDB.users.users.where('tagValues').anyOf(searchTags).distinct().offset(startIndex).limit(pageSize).toArray();
  const displayDataFn = usersArr => {
    displayUsersData(usersArr);
  };

  await displayPagination({
    numberOfRecordsFn,
    itemPageFn,
    displayDataFn,
    selector: '#all-users .extension-pagination',
    currentPage: 1,
    startPage: 1,
    pageSize: 20,
    maxPages: 5,
  });
}

async function findUsersByTagsInClan(searchTags) {
  const clanId = Number(document.getElementById('selectClan')?.value);
  if (!clanId && clanId !== 0) return;
  numberOfRecordsFn = async () =>
    AppDB.users.users
      .where('tagValues')
      .anyOf(searchTags)
      .distinct()
      .filter(user => user.clanId === clanId && user.ex === 0)
      .count();
  itemPageFn = async (startIndex, pageSize) =>
    AppDB.users.users
      .where('tagValues')
      .anyOf(searchTags)
      .distinct()
      .filter(user => user.clanId === clanId && user.ex === 0)
      .offset(startIndex)
      .limit(pageSize)
      .toArray();
  const displayDataFn = usersArr => {
    displayUsersData(usersArr);
  };

  await displayPagination({
    numberOfRecordsFn,
    itemPageFn,
    displayDataFn,
    selector: '#all-users .extension-pagination',
    currentPage: 1,
    startPage: 1,
    pageSize: 20,
    maxPages: 5,
  });
}

async function findUsersByTagsNotInClan(searchTags) {
  const clanId = Number(document.getElementById('selectClan')?.value);
  if (!clanId && clanId !== 0) return;
  numberOfRecordsFn = async () =>
    AppDB.users.users
      .where('tagValues')
      .anyOf(searchTags)
      .distinct()
      .filter(user => user.clanId === clanId && user.ex === 1)
      .count();
  itemPageFn = async (startIndex, pageSize) =>
    AppDB.users.users
      .where('tagValues')
      .anyOf(searchTags)
      .distinct()
      .filter(user => user.clanId === clanId && user.ex === 1)
      .offset(startIndex)
      .limit(pageSize)
      .toArray();
  const displayDataFn = usersArr => {
    displayUsersData(usersArr);
  };

  await displayPagination({
    numberOfRecordsFn,
    itemPageFn,
    displayDataFn,
    selector: '#all-users .extension-pagination',
    currentPage: 1,
    startPage: 1,
    pageSize: 20,
    maxPages: 5,
  });
}

async function searchByTags() {
  const whitelist = await AppDB.settings.tags.toArray();
  const loadButton = document.getElementById('find_tags');

  const searchTagsBlock = document.querySelector('input[name=search-tags]');
  const tagifySearchTags = new Tagify(searchTagsBlock, { whitelist, userInput: false });

  // Логика кнопки "Загрузить" (обновление данных)
  const search = asyncProtectClick(async () => {
    removeAllDom('.user-data-row');
    setProgress(0);
    const searchTags = tagifySearchTags.value.map(tag => tag.value);
    const usersRadioBlock = document.querySelector('#users-radio');
    if (!usersRadioBlock) return;
    const defaultValue = usersRadioBlock.querySelector('input[name="option"]:checked')?.value ?? 'all';
    await handleViewTags(defaultValue, searchTags);
    setProgress(100);
  }, 1000);

  loadButton.onclick = search;
}
//----------------------------------------------
