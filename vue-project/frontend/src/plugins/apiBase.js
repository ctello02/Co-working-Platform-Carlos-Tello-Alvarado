export default {
  install(app) {
    const apiBase = import.meta.env.VITE_API_BASE;

    app.config.globalProperties.$apiBase = apiBase;
    app.config.globalProperties.$resolve = (src) => {
      if (!src) return '';
      // No toques URLs completas, blobs o data URLs
      if (/^(https?:|blob:|data:)/i.test(src)) return src;
      // Si empieza por "/" (p.ej. /uploads/...), prefija con API_BASE
      if (src.startsWith('/')) return apiBase + src;
      return src;
    };
  },
};
