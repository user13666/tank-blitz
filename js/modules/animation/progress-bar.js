/**
 * Check that the number does not exceed 100%
 * @param {number} data
 * @returns {integer} number that will not exceed 100
 */
const widthLineBar = data => (data < 100 ? data : 100);

/**
 * Set the length of the loading line.
 * @param {object} bar - Dom element
 * @param {string} lineClassName - class name of the div we want to change
 * @param {number} widthVal - Percentage by which we want to increase the div block
 */
function moveLineBar(bar, lineClassName, widthVal) {
  const lineClassBlock = bar.getElementsByClassName(lineClassName);
  if (lineClassBlock) {
    const lineBarDom = lineClassBlock[0];
    lineBarDom.style.width = `${widthVal}%`;
  }
}

/**
 * Returns a number that is the percentage by which the div should be enlarged.
 * @param {number} count - current iteration number
 * @param {number} maxCount - total iterations
 * @returns {integer} returns a number which is the percentage by which the div should be enlarged
 */
const lineBarWidth = (count, maxCount) => widthLineBar(Math.round((count / maxCount) * 100));

/**
 * We listen to the load lines with the observer and if
 * the element's textContent changes we execute moveLineBar()
 * @param {string} elemClassName - load block class
 * @param {string} lineClassName - the class of the line block that is changing
 * @param {string} percentageClassName - the class of the block we are listening to, has its value changed
 */
// eslint-disable-next-line no-unused-vars
function lineBarRender(
  elemClassName = 'myProgressLine',
  lineClassName = 'myBarsLine',
  percentageClassName = 'percentageOfCompletion',
) {
  const AllBars = document.getElementsByClassName(elemClassName);
  if (AllBars) {
    Array.prototype.map.call(AllBars, bar => {
      const percentageBlock = bar.getElementsByClassName(percentageClassName);
      if (percentageBlock) {
        const percentageOfCompletion = percentageBlock[0];
        const observer = new MutationObserver(mutationRecords => {
          const widthVal = mutationRecords[0].addedNodes[0].textContent;

          if (!Number.isNaN(+widthVal)) {
            moveLineBar(bar, lineClassName, widthVal);
          }
        });

        observer.observe(percentageOfCompletion, {
          characterData: false,
          attributes: false,
          childList: true,
          subtree: false,
        });
      }
    });
  }
}

/**
 * Update process state and load line length
 * @param {text} idBarName Id of the specific Bar
 * @param {number} loadingCount current iteration number
 * @param {number} allCount total iterations
 * @param {Text} typeName iteration name
 * @param {Text} percentage is the name of the block in which the download percentage changes,
 * which is listened to by lineBarRender()
 * @param {Text} myBarsVal loading page text content
 */
// eslint-disable-next-line no-unused-vars
function changeSizeLineBar(
  idBarName,
  loadingCount,
  allCount,
  typeName,
  percentage = 'percentageOfCompletion',
  myBarsVal = 'myBarsVal',
) {
  if (!Number.isNaN(+loadingCount) && !Number.isNaN(+allCount)) {
    const widthVal = lineBarWidth(loadingCount, allCount);
    const myProgressLoading = document.getElementById(idBarName);
    myProgressLoading.getElementsByClassName(percentage)[0].textContent = widthVal;
    const textBar = `${allCount} / ${loadingCount} ${typeName}`;
    myProgressLoading.getElementsByClassName(myBarsVal)[0].textContent = textBar;
  }
}
