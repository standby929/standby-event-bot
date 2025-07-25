import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';

export async function initI18n(lng: string = 'hu') {
  if (i18next.isInitialized && i18next.language === lng) return;

  await i18next.use(Backend).init({
    lng,
    fallbackLng: 'hu',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}.json'),
    },
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false, // priority matters
  });
}

export { i18next };
