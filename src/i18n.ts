import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';

export async function initI18n() {
  await i18next.use(Backend).init({
    lng: 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}.json'),
    },
    interpolation: {
      escapeValue: false,
    },
  });
}

export { i18next };
