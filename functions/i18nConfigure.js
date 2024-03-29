function i18nConfigure(i18n, locales) {
  i18n.configure({
    locales: locales,
    directory: "./locales",
    defaultLocale: "en",
    retryInDefaultLocale: true,
    autoReload: true,
    objectNotation: true,
    missingKeyFn: function (locale, value) {
      return value;
    },
    mustacheConfig: {
      tags: ["{{", "}}"],
      disable: false,
    },
  });
  console.log("i18n configured");
}

module.exports = {
  i18nConfigure,
};
