// Layouts para EJS: renderiza la vista y la inserta como `body` en views/layouts/<layout>.ejs.
// Uso: res.render('candidato/muro', { layout: 'app', ... }). `layout: false` desactiva el layout.
export function layouts({ defaultLayout = 'public' } = {}) {
  return (req, res, next) => {
    const render = res.render.bind(res);

    res.render = (view, locals = {}, callback) => {
      if (typeof locals === 'function') {
        callback = locals;
        locals = {};
      }
      const layout = locals.layout ?? res.locals.layout ?? defaultLayout;
      if (!layout) return render(view, locals, callback);

      render(view, locals, (err, body) => {
        if (err) return callback ? callback(err) : next(err);
        render(`layouts/${layout}`, { ...locals, body }, callback);
      });
    };

    next();
  };
}
