const changeLabelColor = (thisDom, textDefault, textActive) => {
  thisDom.parentElement.style.color = thisDom.checked ? textActive : textDefault;
};

/**
 * Changes the text color of the parent element
 * @param {string} textActive - Text color
 * @param {string} textDefault - Text default color
 * @param {Object} checkboxList - Dom Element
 */
function parentElementChangeColor(textActive, textDefault, checkboxList) {
  if ((textActive, checkboxList)) {
    if (checkboxList.length !== 0) {
      Array.prototype.map.call(checkboxList, currentDom => {
        currentDom.addEventListener('click', event => {
          if (event.target.type === 'radio') {
            const radioList = document.getElementsByName(event.target.name);
            Array.prototype.map.call(radioList, currentListDom => {
              currentListDom.parentElement.style.color = textDefault;
            });
          }
          changeLabelColor(event.target, textDefault, textActive);
        });
        if (currentDom.checked) {
          currentDom.parentElement.style.color = textActive;
        }
      });
    }
  }
}

// eslint-disable-next-line no-unused-vars
function showCheckboxes(expanded, checkboxes, selectOptionVal) {
  if (checkboxes === null || selectOptionVal === null) return undefined;
  const textActive = '#d9c859';
  const textDefault = '#fff';

  if (!expanded) {
    checkboxes.style.display = 'block';
    selectOptionVal.style.color = textActive;
    const checkboxList = document.getElementsByClassName('select-input-value-checkbox');
    if (checkboxList.length !== 0) {
      parentElementChangeColor(textActive, textDefault, checkboxList);
    }
    return true;
  }
  selectOptionVal.style.color = textDefault;
  checkboxes.style.display = 'none';
  return false;
}
