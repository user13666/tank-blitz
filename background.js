const setSettings = {
  delaysServerRequest: 6000,
  delaysStorageRequest: 2000,
  delaysErrorMinute: 5,
  clanList: '',

  workloadOneDay: 2,
  workloadTwoDay: 8,
  workloadThreeDay: 14,
  workloadFourDay: 21,
  workloadFiveDay: 30,
  workloadSixDay: 40,
  workloadSevenDay: 40,
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(Object.keys(setSettings), result => {
    for (const str in setSettings) {
      if (typeof result[str] === 'undefined') {
        chrome.storage.local.set(
          {
            [str]: setSettings[str],
          },
          () => {
            console.log(`Value set${setSettings[str]}`);
          },
        );
      }
    }
  });
});
