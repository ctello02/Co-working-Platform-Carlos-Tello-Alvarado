export default {
  install(app) {
    const apiBase = import.meta.env.VITE_API_BASE;

    app.config.globalProperties.$apiBase = apiBase;
    app.config.globalProperties.$resolve = (src) => {
      if (!src) return '';
      if (/^(https?:|blob:|data:)/i.test(src)) return src;
      if (src.startsWith('/')) return apiBase + src;
      return src;
    };
  },
};
