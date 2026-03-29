// eslint-disable-next-line no-unused-vars
function floatLineIndicator(float, currentDom) {
  let currentRage;
  const floatRage = [
    {
      min: 0,
      max: 0.07,
      classname: 'factory_new',
    },
    {
      min: 0.07,
      max: 0.15,
      classname: 'minimal_wear',
    },
    {
      min: 0.15,
      max: 0.38,
      classname: 'field-tested ',
    },
    {
      min: 0.38,
      max: 0.45,
      classname: 'well-worn',
    },
    {
      min: 0.45,
      max: 1,
      classname: 'battle-scarred',
    },
  ];

  floatRage.forEach(rangeData => {
    const { min, max } = rangeData;
    if (float >= min && float <= max) currentRage = rangeData;
  });

  const { min, max, classname } = currentRage;
  if (min !== undefined && max !== undefined && classname !== undefined) {
    const floatBlock = currentDom.getElementsByClassName(classname)[0];

    if (floatBlock !== undefined) insertFloatIndicator(floatBlock, float, max);
  }
}
