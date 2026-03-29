/* eslint-disable no-unused-vars */

/**
 * Function responsible for displaying the chart.
 * @param {Array} statsData - points array
 */
function showMyPointsMiniChart(statsData, canvasId) {
  // eslint-disable-next-line prefer-const
  let { pointsArr, teamworkArr, nowTime, firstData } = myPointDataForDiagramsProcessing(statsData);
  pointsArr = pointsArr.length === 0 ? { x: Date.now(), y: 0 } : pointsArr;
  teamworkArr = teamworkArr.length === 0 ? { x: Date.now(), y: 0 } : teamworkArr;

  const scalesConfig = {
    x: {
      display: false,
      min: firstData,
      max: nowTime,
      type: 'timeseries',
    },
    y: {
      display: false,
      type: 'linear',
      position: 'left',
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
          borderColor: context => getGradient(context),
          pointBorderWidth: 0,
          pointHitRadius: 0, // Но оставить область для срабатывания тултипа
          hoverRadius: 0, // Точка появится только при наведении

          borderWidth: 4,
          data: pointsArr,
          yAxisID: 'y',
        },
        {
          radius: 0,
          label: 'Кооп',
          fill: true,
          tension: 0,
          borderDash: [1, 1], // ПУНКТИРНАЯ ЛИНИЯ [длина штриха, длина пропуска] в пикселях

          // Включаем заливку
          backgroundColor: '#6effff2f',
          borderColor: context => getGradient(context),

          pointBorderWidth: 0,
          pointHitRadius: 0, // Но оставить область для срабатывания тултипа
          hoverRadius: 0, // Точка появится только при наведении

          borderWidth: 4,
          data: teamworkArr,
          yAxisID: 'y',
        },
      ],
    },
    options: {
      animation: false, // Отключение всех анимаций
      // combined interaction popup
      interaction: {
        mode: 'none',
      },

      point: {
        radius: 0, // скрывает точки в обычном состоянии
        hoverRadius: 0, // скрывает точки при наведении (эффект увеличения)
        hitRadius: 0, // отключает область чувствительности точки
      },

      legend: { display: false },
      scales: scalesConfig,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false, // полностью скрывает тултипы со значениями
        },
        decimation: {
          enabled: true,
          algorithm: 'lttb', // 'min-max' или 'lttb'
          samples: 15, // До какого количества точек сократить данные на экране
        },
      },
    },
  };

  destroyChart(canvasId);
  const chart = new Chart(canvasId, globalConfig);
}
