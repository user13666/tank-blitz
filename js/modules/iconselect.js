class IconSelect {
  constructor(elementId, parameters = {}) {
    this.container = document.getElementById(elementId);
    if (!this.container) throw new Error(`Element #${elementId} not found`);

    const { columns = 3, selectedSize = 48, iconSize = 32 } = parameters;
    this.params = { columns, selectedSize, iconSize };
    this.icons = [];
    this.selectedIndex = -1;

    this._init();
  }

  _init() {
    this.container.classList.add('icon-select');
    this.container.style.setProperty('--columns', this.params.columns);
    this.container.style.setProperty('--selected-size', `${this.params.selectedSize}px`);
    this.container.style.setProperty('--icon-size', `${this.params.iconSize}px`);

    // 1. Создаем структуру без innerHTML
    const selectedBox = document.createElement('div');
    selectedBox.className = 'selected-box';

    const selectedIconDiv = document.createElement('div');
    selectedIconDiv.className = 'selected-icon';
    this.selectedImg = document.createElement('img');
    selectedIconDiv.appendChild(this.selectedImg);

    const componentIconDiv = document.createElement('div');
    componentIconDiv.className = 'component-icon';

    // 1. Создаем SVG
    const svgNS = 'http://www.w3.org/2000/svg'; // Не забудьте объявить переменную для path

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('height', '30px');
    svg.setAttribute('width', '30px');
    svg.setAttribute('viewBox', '0 -960 960 960');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute(
      'd',
      'M227-346q-16-30-25.5-63.5T192-480q0-121 85-206t209-82l-57-57 51-51 144 144-144 144-51-51 57-57q-94-2-158 62t-64 154q0 22 4 42t12 39l-53 53ZM480-84 336-228l144-144 51 51-57 57q94 2 158-62t64-154q0-22-4-42t-12-39l53-53q16 30 25.5 63.5T768-480q0 120-85 205.5T474-192l57 57-51 51Z',
    );
    path.setAttribute('fill', '#000000');

    // ВОТ ЭТА СТРОКА ПРОПУЩЕНА:
    svg.appendChild(path);

    // Теперь svg содержит внутри себя path, и его можно добавлять в основной документ
    componentIconDiv.appendChild(svg);

    selectedBox.append(selectedIconDiv, componentIconDiv);

    this.box = document.createElement('div');
    this.box.className = 'icon-select-box';

    this.container.append(selectedBox, this.box);

    this._bindEvents();
  }

  _bindEvents() {
    this.container.addEventListener('click', e => {
      e.stopPropagation();

      // Проверяем место только в момент открытия
      if (!this.container.classList.contains('open')) {
        const rect = this.container.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const buffer = 180; // Ваши 170px (max-height) + запас

        if (spaceBelow < buffer) {
          this.container.classList.add('drop-up');
        } else {
          this.container.classList.remove('drop-up');
        }
      }

      const iconItem = e.target.closest('.icon-item');
      if (iconItem) {
        this.setSelectedIndex(Number(iconItem.dataset.index));
        this.container.classList.remove('open');
        return;
      }

      this.container.classList.toggle('open');
    });

    window.addEventListener('click', () => this.container.classList.remove('open'));
  }

  refresh(iconData) {
    this.icons = iconData;

    // 2. Оптимизированная отрисовка списка через DocumentFragment
    const fragment = document.createDocumentFragment();

    // Очищаем старое содержимое (безопасный способ)
    while (this.box.firstChild) {
      this.box.removeChild(this.box.firstChild);
    }

    this.icons.forEach((icon, index) => {
      const item = document.createElement('div');
      item.className = 'icon-item';
      item.dataset.index = index;
      item.title = icon.iconValue;

      const img = document.createElement('img');
      img.src = icon.iconFilePath;
      img.loading = 'lazy';

      item.appendChild(img);
      fragment.appendChild(item);
    });

    this.box.appendChild(fragment);
    this.setSelectedIndex(0);
  }

  setSelectedIndex(index) {
    if (index === this.selectedIndex) return;
    const items = this.box.children;

    if (this.selectedIndex !== -1 && items[this.selectedIndex]) {
      items[this.selectedIndex].classList.remove('selected');
    }

    const icon = this.icons[index];
    if (icon && items[index]) {
      this.selectedIndex = index;
      const selectedItem = items[index];
      selectedItem.classList.add('selected');

      // --- Добавлено: Автоматическая прокрутка ---
      selectedItem.scrollIntoView({
        behavior: 'smooth', // плавно
        block: 'nearest', // до ближайшего края видимости
      });

      this.selectedImg.src = icon.iconFilePath;
      this.selectedImg.alt = icon.iconValue;

      this.container.dispatchEvent(
        new CustomEvent('changed', {
          detail: { index, value: icon.iconValue, item: icon },
        }),
      );
    }
  }

  // Выбор по значению (iconValue)
  setSelectedByValue(value) {
    const index = this.icons.findIndex(icon => icon.iconValue === value);
    if (index !== -1) {
      this.setSelectedIndex(index);
    } else {
      console.warn(`Icon with value "${value}" not found`);
    }
  }

  // Выбор по части имени файла (iconFilePath)
  setSelectedByFileName(fileName) {
    const index = this.icons.findIndex(icon => icon.iconFilePath.includes(fileName));
    if (index !== -1) {
      this.setSelectedIndex(index);
    }
  }

  get selectedValue() {
    return this.icons[this.selectedIndex]?.iconValue;
  }
}

// 1. Выбрать по значению
// iconSelect.setSelectedByValue('2.jpg');

// 2. Выбрать, если знаешь только, что в файле есть слово 'red'
// iconSelect.setSelectedByFileName('red-circle.png');
