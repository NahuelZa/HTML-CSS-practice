import express from 'express';
import { engine } from 'express-handlebars';
import { createServer as createViteServer } from 'vite';
import data from './data/data.json' with { type: 'json' };

const port = process.env.PORT || 5173;

async function createServer() {
  const app = express();

  app.engine('hbs', engine({ extname: '.hbs', defaultLayout: 'main' }));
  app.set('view engine', 'hbs');
  app.set('views', './views');

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.get('/', async (req, res, next) => {
    try {
      const rendered = await new Promise((resolve, reject) => {
        app.render('index', { data }, (err, html) => (err ? reject(err) : resolve(html)));
      });
      const html = await vite.transformIndexHtml(req.originalUrl, rendered);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (err) {
      vite.ssrFixStacktrace(err);
      next(err);
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();
