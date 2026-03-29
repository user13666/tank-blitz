/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/**
 * Get data from storage.
 * @param {string | number} key - local storage key
 * @returns {*} the value we get from local storage
 */
async function readLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], dataItemId => {
      if (dataItemId[key] === undefined) {
        reject();
      } else {
        resolve(dataItemId[key]);
      }
    });
  });
}

/**
 * Save to local storage.
 * @param {string | number} key - local storage key
 * @param {*} ArrObjects what we want to keep
 * @returns {boolean} displays the progress status of saving to local storage
 */
async function saveLocalStorage(key, ArrObjects) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: ArrObjects }, () => {
      resolve();
    });
  });
}

/**
 *  Interval between Http requests.
 *  @param {number} time - delay time between requests
 *  @param {number} randomVal - is the maximum random value that is added to the time
 *  @returns {Promise} Promise object which contains setTimeout delay
 */
const PauseBetweenOperations = (time, randomVal) =>
  new Promise(done => {
    setTimeout(() => done(), time + Math.floor(Math.random() * randomVal));
  });

const domRemove = Dom => {
  if (Dom !== undefined && Dom !== null) Dom.remove();
};
function removeAllDom(selector) {
  document.querySelectorAll(selector).forEach(elementDom => domRemove(elementDom));
}

const isNotEmptyObj = obj =>
  obj !== null && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length > 0;

const checkNumInputs = dom => Array.from(dom).every(input => !Number.isNaN(input.dom));

/**
 * Функция отрисовки диаграммы очков
 * @param {Array} statsData
 * @returns { {pointsArr: {x: number, y: number}[], nowTime: number, firstData: number,} }
 * pointsArr: {x: number, y: number}[] -array of points
 */
function myPointDataForDiagramsProcessing(statsData) {
  const keys = Object.keys(statsData);
  if (keys.length <= 1) return { pointsArr: [], teamworkArr: [], nowTime: 0, firstData: 0 };
  // keys.sort((a, b) => Date.parse(a) - Date.parse(b));

  const pointsArr = [];
  const teamworkArr = [];

  keys.forEach(key => {
    const timestamp = Date.parse(key);
    const [point, teamwork] = statsData[key];

    pointsArr.push({ x: timestamp, y: +point });
    teamworkArr.push({ x: timestamp, y: +teamwork });
  });

  return {
    pointsArr,
    teamworkArr,
    firstData: Date.parse(keys[0]),
    nowTime: Date.parse(keys[keys.length - 1]),
  };
}

/**
 * Функция удаления <canvas> диаграммы по id
 * @param {string} styleId
 */
function destroyChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  // 1. Ищем, есть ли на этом canvas уже созданный график
  const existingChart = Chart.getChart(canvas);
  // 2. Если нашли — удаляем его
  if (existingChart) existingChart.destroy();
}

function syncProtectClick(func, delay = 2000) {
  let lastClick = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastClick < delay) return undefined;
    lastClick = now;
    return func.apply(this, args); // гарантировать корректную передачу контекста this, если функция fn не является стрелочной
  };
}

function asyncProtectClick(func, delay = 2000) {
  let lastClick = 0;
  let isLocked = false;
  return async function (...args) {
    if (isLocked) return undefined;
    isLocked = true;
    const now = Date.now();
    try {
      if (now - lastClick < delay) return undefined;
      lastClick = now;
      return await func.apply(this, args);
    } finally {
      isLocked = false; // Разблокировка только после завершения
    }
  };
}

// Функция для создания "умного" градиента
function getGradient(context) {
  const { chart } = context;
  const { ctx, chartArea } = chart;

  if (!chartArea) {
    // Ждем первого рендеринга, когда Chart.js рассчитает размеры
    return null;
  }

  // Создаем градиент точно по ширине области рисования
  const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
  gradient.addColorStop(0, '#505050ff');
  gradient.addColorStop(1, '#434343ff');

  return gradient;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sortObj(obj) {
  const keys = Object.keys(obj).sort();
  const sortedObj = {};
  for (let i = 0; i < keys.length; i += 1) {
    sortedObj[keys[i]] = obj[keys[i]];
  }
  return sortedObj;
}

const arrLimit = (arr, value, limit = 100) => [value, ...arr].slice(0, limit);
const ObjLimit = (arr, limit = -106) => Object.fromEntries(Object.entries(arr).slice(limit));

function handlerPicker(settings) {
  const defaultConfig = {
    selectedIconWidth: 28,
    selectedIconHeight: 28,
    selectedBoxPadding: 1,
    iconsWidth: 23,
    iconsHeight: 23,
    boxIconSpace: 1,
    vectoralIconNumber: 4,
    horizontalIconNumber: 4,
  };
  const defaultIconPath = 'images/png/select/';

  const { pickerId, inputId, config = defaultConfig, iconPath = defaultIconPath, icon = '' } = settings;
  const iconSelect = new IconSelect(pickerId, config);
  // Генерируем массив за один проход без лишних копирований
  const icons = Array.from({ length: 91 }, (_, i) => ({
    iconFilePath: chrome.runtime.getURL(`${iconPath}${i}.jpg`),
    iconValue: String(`${i}.jpg`),
  }));
  iconSelect.refresh(icons);
  if (icon) iconSelect.setSelectedByFileName(icon);

  const inputIcon = document.getElementById(inputId);
  if (inputIcon) inputIcon.value = iconSelect.selectedValue;

  iconSelect.container.addEventListener('changed', () => {
    if (inputIcon) inputIcon.value = iconSelect.selectedValue;
  });
}
