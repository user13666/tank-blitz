/* eslint-disable no-unused-vars */
/**
 *  Steam buy order scanner - is browser extension which to keep your Steam buy Market orders profitable.
 *  https://github.com/user81/Steam-buy-order-scanner-chrome
 *  Copyright (C) 2021 Ermachenya Aleksandr
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 *A script that calls the server and returns its response as a string.
 *@param {string} url URL for requests to the server
 *@param {number} attempts number of repetitions
 *@param {number} requestInterval pause between requests (milliseconds)
 *@param {number} errorPause pause between errors (minutes)
 *@returns {string} Json string
 */
const httpErrorPause = (url, attempts = 8, requestInterval = 6000, errorPause = 5) =>
  new Promise((resolve, reject) => {
    const request = new Request(url, {
      method: 'GET',
    });

    fetch(request)
      .then(response => {
        if (response.status === 429 || response.status === 2 || response.status === 500) {
          delayRequestGet(httpErrorPause, url, attempts, requestInterval, errorPause);
          return undefined;
        }
        if (response.status === 403) {
          resolve('Error request');
          return undefined;
        }
        if (!response.ok) {
          console.log(`Code: ${response.status} Text: ${response.statusText}`);
          reject(new Error({ status: response.status, statusText: response.statusText }));
        }
        return response.text();
      })
      .then(nextResponseJSON => {
        if (nextResponseJSON === null) {
          reject(new Error('Error!'));
        }
        resolve(nextResponseJSON);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });

async function delayRequestGet(externalFunction, url, attempts = 8, requestInterval = 6000, errorPause = 5) {
  if (attempts <= 0) {
    await waitTime((+errorPause + Math.floor(Math.random() * 5)) * 60000);
    return externalFunction(externalFunction, url, 8, requestInterval, errorPause);
  }
  await waitTime(5000 + +requestInterval + Math.floor(Math.random() * 50));
  return externalFunction(externalFunction, url, attempts - 1, requestInterval, errorPause);
}

function waitTime(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 *A function that sends a POST request.
 *@param {string} httpUrl - request link
 *@param {string} httpParams - request parameters
 *@param {number} attempts - number of repetitions
 *@param {number} requestInterval - pause between requests (milliseconds)
 *@param {number} errorPause - pause between errors (minutes)
 *@returns {Object} server response to POST request
 */
const httpPostErrorPause = (httpUrl, httpParams, attempts = 8, requestInterval = 6000, errorPause = 5) =>
  new Promise((resolve, reject) => {
    const request = new Request(httpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: httpParams,
    });

    const fetchRequest = window.content !== undefined ? window.content.fetch : fetch;

    fetchRequest(request)
      .then(response => {
        if (response.status === 429 || response.status === 2 || response.status === 500) {
          delayRequestGet(httpPostErrorPause, url, attempts, requestInterval, errorPause);
          return undefined;
        }

        if (!response.ok) {
          console.log(`Code: ${response.status} Text: ${response.statusText}`);
          reject(new Error(`Code: ${response.status} Text: ${response.statusText}`));
        }
        return response.text();
      })
      .then(nextResponseText => {
        if (nextResponseText === null) {
          resolve({ error: null });
        } else if (nextResponseText === '') {
          resolve({ response: '' });
        } else if (!isValidJSON(nextResponseText)) resolve(nextResponseText);
        else {
          const nextResponseJSON = JSON.parse(nextResponseText);
          if (Object.keys(nextResponseJSON).length === 0) {
            resolve({ success: 1 });
          } else {
            resolve(nextResponseJSON);
          }
        }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });

const pageParser = (url, attempts = 8, requestInterval = 6000, errorPause = 5) =>
  new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (response.status === 429 || response.status === 2 || response.status === 500) {
          delayRequestGet(pageParser, url, attempts, requestInterval, errorPause);
          return undefined;
        }
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const document = parser.parseFromString(html, 'text/html');
        resolve(document);
      })
      .catch(error => {
        console.log('Failed to fetch page: ', error);
        reject(error);
      });
  });
