export default {
  install(app) {
    const apiBase = import.meta.env.VITE_API_BASE || '';

    const join = (base, path) =>
      `${base}`.replace(/\/+$/, '') + '/' + `${path}`.replace(/^\/+/, '');

    app.config.globalProperties.$apiBase = apiBase;

    app.config.globalProperties.$resolve = (src) => {
      if (!src) return '';
      if (/^(https?:|blob:|data:)/i.test(src)) return src; // ruta absoluta

      const path = src.startsWith('/') ? src : `/${src}`;

      return apiBase ? join(apiBase, path) : path;
    };
  },
};
