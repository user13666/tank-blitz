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
    const namesObject = {};
    const descriptionObject = {};

    for (const SettingsObjectKey in data) {
      if (!Object.hasOwn(data, SettingsObjectKey)) continue;
      // 'unknown': chrome.i18n.getMessage('warningsColorCGood') || '',
      descriptionObject[`${SettingsObjectKey}_n`] = chrome.i18n.getMessage(`${SettingsObjectKey}_d`) || '';
      namesObject[`${SettingsObjectKey}_d`] = chrome.i18n.getMessage(`${SettingsObjectKey}_n`) || '';
    }

    const extensionSettingsSet = [
      {
        tab_container: '#tab-global',
        settings: [
          {
            setting_container: 'global-settings',
            heder: chrome.i18n.getMessage(`delays_n`) || 'Delays.',
            description: chrome.i18n.getMessage(`delays_d`) || 'Global settings.',
            lists: [
              { name: 'delaysServerRequest', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'delaysStorageRequest', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'delaysErrorMinute', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'clanList', input_type: { type_name: 'text', attribute: 'autofocus' } },
            ],
          },
          {
            setting_container: 'clan-workload',
            heder: chrome.i18n.getMessage(`workload_n`) || 'Delays.',
            description: chrome.i18n.getMessage(`workload_d`) || 'Global settings.',
            lists: [
              { name: 'workloadOneDay', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'workloadTwoDay', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'workloadThreeDay', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'workloadFourDay', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'workloadFiveDay', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'workloadSixDay', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
              { name: 'workloadSevenDay', input_type: { type_name: 'number', step: '1', min: '0', max: '' } },
            ],
          },
        ],
      },
    ];

    await displayStorageValues(extensionSettingsSet, data, descriptionObject, namesObject);
  },
);

async function displayStorageValues(extensionSettings, data, d, n) {
  for (let eindex = 0; eindex < extensionSettings.length; eindex += 1) {
    const tab = extensionSettings[eindex];
    const { tab_container, settings } = tab;
    const tabBlock = document.querySelector(`${tab_container}~.ui-tab`);
    if (!tabBlock) return;
    for (let sindex = 0; sindex < settings.length; sindex += 1) {
      const settingsSet = settings[sindex];
      const { setting_container, heder, description, lists } = settingsSet;
      insertExtensionSettingsTab(tabBlock, setting_container, heder, description, 'beforeend');
      for (let lindex = 0; lindex < lists.length; lindex += 1) {
        const setting = lists[lindex];
        const settingsBlock = tabBlock.querySelector(`#${setting_container} .settings-container`);
        if (!settingsBlock) return;
        const { name, input_type } = setting;

        insertExtensionSetting(
          settingsBlock,
          n[`${name}_n`] ?? 'not exist',
          d[`${name}_d`] ?? 'not exist',
          data,
          name,
          input_type,
          'beforeend',
        );
        if (input_type.type_name === 'number' || input_type.type_name === 'text' || input_type.type_name === 'url') {
          if (name === 'clanList') {
            const clansTagify = new Tagify(document.querySelector('input[name=clanList]'), {
              // Регулярное выражение, разрешающее только цифры (от одной и более)
              pattern: /^\d+$/,

              // Дополнительные опции (по желанию):
              delimiters: ',', // Разделитель тегов (по умолчанию запятая)
              maxTags: Infinity, // Максимальное количество тегов
              placeholder: 'Введите Id клана',

              // Other Tagify settings
              editTags: false, // Set to false to disable editing of tags
            });
            clansTagify.editTags = false;

            const tagsString = arrObjects => arrObjects.map(item => item.value).join(', ');
            const onAddTag = async () => {
              await saveLocalStorage(name, tagsString(clansTagify.value));
            };
            const onRemove = async () => {
              await saveLocalStorage(name, tagsString(clansTagify.value));
            };
            clansTagify.on('add', onAddTag).on('remove', onRemove);
          }
          document.getElementById(name).oninput = async event => {
            const text = event.target?.value ?? '';
            if (!text) return;
            if (input_type.type_name === 'number' && Number.isNaN(+text)) return;

            const IntervalsArr = ['delaysServerRequest', 'delaysStorageRequest'];
            if ((IntervalsArr.includes(name) && +text >= 1000) || +text > 0) {
              await saveLocalStorage(name, text);
            }
          };
        } else {
          document.getElementById(name).onchange = async event => {
            const text = event.target?.value ?? '';
            if (!text) return;
            if (input_type.type_name === 'checkbox') {
              const checkedBool = event.target?.checked ?? false;
              await saveLocalStorage(name, checkedBool);
              return;
            }
            await saveLocalStorage(name, text);
          };
        }
      }
    }
  }
}
