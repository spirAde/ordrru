import { addLocaleData } from 'react-intl';
import areIntlLocalesSupported from 'intl-locales-supported';

const IntlUtils = {
  loadPolyfill(locale) {
    if (window.Intl && areIntlLocalesSupported(locale)) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      console.log(`Intl or locale data for "${locale}" not available, downloading the polyfill...`);
      require.ensure(['intl'], require => {
        require('intl');
        console.log(`Intl polyfill for "${locale}" has been loaded`);
        resolve();
      }, 'intl');
    });
  },

  loadLocaleData(locale) {
    require('expose?ReactIntl!react-intl');

    return new Promise(resolve => {
      switch (locale) {
      case 'ru':
        if (!areIntlLocalesSupported('ru')) {
          require.ensure(['intl/locale-data/jsonp/ru', 'react-intl/locale-data/ru'], require => {
            require('intl/locale-data/jsonp/ru');
            addLocaleData(require('react-intl/locale-data/ru'));
            console.log(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`);
            resolve();
          }, 'locale-ru');
        } else {
          require.ensure(['react-intl/locale-data/ru'], require => {
            addLocaleData(require('react-intl/locale-data/ru'));
            console.log(`ReactIntl locale-data for "${locale}" has been downloaded`);
            resolve();
          }, 'react-locale-ru');
        }
        break;

      default:
        if (!areIntlLocalesSupported('en')) {
          require.ensure(['intl/locale-data/jsonp/en'], require => {
            require('intl/locale-data/jsonp/en');
            console.log(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`);
            resolve();
          }, 'locale-en');
        } else {
          resolve();
        }
      }
    });
  }
};

export default IntlUtils;
