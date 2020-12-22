/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const findChrome = require('carlo/lib/find_chrome');

const getBrowser = async () => {
  try {
    // eslint-disable-next-line import/no-unresolved
    const puppeteer = require('puppeteer');
    return puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--no-sandbox',
      ],
    });
  } catch (error) {
    // console.log(error)
  }

  try {
    // eslint-disable-next-line import/no-unresolved
    const puppeteer = require('puppeteer-core');
    const findChromePath = await findChrome({});
    const { executablePath } = findChromePath;
    return puppeteer.launch({
      executablePath,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--no-sandbox',
      ],
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('🧲 no find chrome');
  }
  throw new Error('no find puppeteer');
};

module.exports = getBrowser;
