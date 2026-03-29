/* eslint-disable no-unused-vars */

/**
 * Function responsible for displaying the chart.
 * @param {Array} statsData - points array
 */
function showMyPointsChart(statsData, requirement = 0) {
  const chromeLang = (navigator.language || 'ru').split('-')[0];
  const languageCode = moment.locales().includes(chromeLang) ? chromeLang : 'ru';
  moment.locale(languageCode);

  // eslint-disable-next-line prefer-const
  let { pointsArr, teamworkArr, nowTime, firstData } = myPointDataForDiagramsProcessing(statsData);
  pointsArr = pointsArr.length === 0 ? { x: Date.now(), y: 0 } : pointsArr;
  teamworkArr = teamworkArr.length === 0 ? { x: Date.now(), y: 0 } : teamworkArr;
  const zoomConfig = {
    zoom: {
      wheel: {
        enabled: false,
      },
      drag: {
        enabled: true,
      },
      pinch: {
        enabled: false,
      },
      mode: 'x',
    },
  };

  const scalesConfig = {
    x: {
      fontColor: 'white',
      position: 'bottom',
      // set default range min max
      min: firstData,
      max: nowTime,
      type: 'timeseries',
      ticks: {
        color: '#3f3f3f',
        autoSkip: false,
        maxRotation: 45,
        minRotation: 45,
        source: 'data',
      },
      time: {
        unit: 'day',
        parser: 'MM/DD/YYYY',
        tooltipFormat: 'll HH:mm',
        displayFormats: {
          day: 'MM/DD/YY',
        },
        display: true,
        /* offsetAfterAutoskip: true, */
      },
      grid: {
        color: '#6f6f6fff',
        borderColor: '#6f6f6fff',
        tickColor: '#6f6f6fff',
      },
    },
    y: {
      fontColor: 'white',
      type: 'linear',
      position: 'left',
      grid: {
        color: '#6f6f6fff',
        borderColor: '#6f6f6fff',
        tickColor: '#6f6f6fff',
      },
      ticks: {
        color: '#cbcbcbff',
      },
    },
  };

  const annotation = {
    line1: {
      type: 'box',
      drawTime: 'afterDraw', // Рисуем в фоне, чтобы данные были сверху
      yMin: 0,
      yMax: requirement,
      backgroundColor: 'rgba(255, 0, 0, 0.19)',
    },
  };
  const globalConfig = {
    type: 'line',
    data: {
      datasets: [
        {
          radius: 0,
          label: 'очков',
          fill: false,
          tension: 0,
          backgroundColor: '#cbcbcbff',
          // ГРАДИЕНТ НАЗНАЧАЕТСЯ ЗДЕСЬ
          borderColor: context => getGradient(context),
          // ... другие настройки

          pointBorderWidth: 0,
          pointHitRadius: 10, // Но оставить область для срабатывания тултипа
          hoverRadius: 5, // Точка появится только при наведении

          borderWidth: 4,
          data: pointsArr,
          yAxisID: 'y',
        },
        {
          radius: 0,
          label: 'Кооп',
          fill: true,
          tension: 0,
          borderDash: [5, 5], // ПУНКТИРНАЯ ЛИНИЯ [длина штриха, длина пропуска] в пикселях

          // Включаем заливку
          backgroundColor: '#6effff2f',
          borderColor: context => getGradient(context),

          pointBorderWidth: 0,
          pointHitRadius: 10, // Но оставить область для срабатывания тултипа
          hoverRadius: 5, // Точка появится только при наведении

          borderWidth: 4,
          data: teamworkArr,
          yAxisID: 'y',
        },
      ],
    },
    options: {
      // combined interaction popup
      responsive: true,
      maintainAspectRatio: false,

      animation: false, // Отключение всех анимаций

      interaction: {
        mode: 'point',
        intersect: false,
      },
      legend: { display: false },
      scales: scalesConfig,
      plugins: {
        zoom: zoomConfig,
        legend: {
          display: false,
        },
        annotation: {
          annotations: annotation,
        },
        decimation: {
          enabled: true,
          algorithm: 'min-max', // 'min-max' или 'lttb'
          samples: 500, // До какого количества точек сократить данные на экране
        },
      },
    },
  };
  destroyChart(pointsChart);
  const chart = new Chart(`pointsChart`, globalConfig);
  document.getElementById(`resetChart`).onclick = () => {
    chart.resetZoom();
  };
}
