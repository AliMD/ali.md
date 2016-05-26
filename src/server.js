/**
 * alimd website and url shortner
 * http://ali.md/git
 */

import http from 'http';
import debug from 'debug';
import URL from 'url';

import * as shortener from './shortener.js';
import {getEnv} from './1utill.js'

const

log = debug('alimd:server'),

config = {
  host: getEnv('AliMD_HOST') || '0.0.0.0',
  port: getEnv('AliMD_PORT') || '8080',
  not_found: getEnv('AliMD_NOTFOUND') || '/404/',
  addurl: getEnv('AliMD_ADDURL') || '/addurl',
  userNewRequestUrl: getEnv('AliMD_USER_NEW_REQUEST_URL') || 'https://github.com/AliMD/alimd/issues/new',
  adminPass: getEnv('AliMD_ADMIN_PASS') || 'pass',

},

main = () => {
  log('App start');
  log(config);
  makeServer();
},

makeServer = () => {
  http
  .createServer(serverListener)
  .listen(config.port, config.host)
  ;
  console.log(`Server start on http://${config.host}:${config.port}/`);
},

serverListener = (req, res) => {
  log(`New request: ${req.url}`);
  req.url = URL.parse(req.url, true);

  if (!checkInternalRouters(req, res)) {
    redirect(req, res);
  }

  res.end();
},

checkInternalRouters = (req, res) => {
  log('checkInternalRouters');
  let ret = true;
  switch (req.url.pathname) {
    case config.not_found:
      page404(req, res);
      break;

    case config.addurl:
      addurl(req, res);
      break;

    default:
      ret = false;
  }
  return ret;
},

page404 = (req, res) => {
  log('page404');
  res.writeHead(404, {
    'Content-Type': 'text/html'
  });
  res.write(`<!DOCTYPE html><html><body>
  <h1 style="text-align: center; margin-top: 1em; font-size: 7em;">404</h1>
  <p style="text-align: center; margin-top: 1.5em; font-size: 1.2em;">If you want to add this just tell me <a href="${config.userNewRequestUrl}">here</a></p>
  </body></html>`);
},

addurl = (req, res) => {
  log('addurl');
  log(req.url.query);
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });

  if (req.url.query.short && req.url.query.short.length && shortener.addurl(req.url.query.short || '', req.url.query.url || '')) {
    res.write(`<!DOCTYPE html><html><body>
    <p style="text-align: center; margin-top: 1em; font-size: 1.2em;">
      Success.<br/>
      <a href="/${req.url.query.short}">ali.md/${req.url.query.short}</a> =&gt; ${req.url.query.url}
    </p>
    </body></html>`);
  } else {
    res.write(`<!DOCTYPE html><html><body>
    <form action="${config.addurl}" target="_blank">
      <input type="text" name="short" value="" placeholder="short" />
      <input type="text" name="url" value="" placeholder="url" />
      <input type="password" name="pass" value="" placeholder="password" />
      <input type="submit" value="Send" />
    </form>
    </body></html>`);
  }
},

redirect = (req, res) => {
  let expanded = shortener.find(req.url.pathname) || {url: config.not_found};
  log(`redirect to ${expanded.url}`);
  res.writeHead(expanded.mode === 'permanently' ? 301 : 302, {
    Location: expanded.url
  });
}

;main();
