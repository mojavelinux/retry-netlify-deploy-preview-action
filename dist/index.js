/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 781:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 869:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 851:
/***/ ((module) => {

module.exports = eval("require")("netlify");


/***/ }),

/***/ 707:
/***/ ((module) => {

module.exports = eval("require")("node-fetch");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(781)
const { context } = __nccwpck_require__(869)
const fetch = __nccwpck_require__(707)
const Netlify = __nccwpck_require__(851)

run()

async function run () {
  try {
    const client = new Netlify(core.getInput('netlify-token'))
    const siteID = core.getInput('site-id') || (await resolveSiteID(
      client,
      core.getInput('site-account') || context.repo.owner,
      core.getInput('site-name') || context.repo.repo
    ))
    if (siteID) {
      const pullRequestID = core.getInput('pull-request-url').split('/').pop()
      const deploy = await findDeployForPullRequest(client, siteID, pullRequestID)
      if (deploy) {
        await retryDeploy(client, deploy)
      } else {
        core.setFailed('Could not find the deploy preview for this pull request.')
      }
    } else {
      core.setFailed('Could not resolve ID for Netlify site.')
    }
  } catch (err) {
    core.setFailed(err.message)
  }
}

async function resolveSiteID (client, accountSlug, siteName) {
  return ((await client.listSitesForAccount({ account_slug: accountSlug, name: `^${siteName}$` }))[0] || {}).site_id
}

async function findDeployForPullRequest (client, siteID, pullRequestID) {
  let deploy
  let page = 1
  const marker = `https://deploy-preview-${pullRequestID}--`
  while (deploy == null) {
    const deploys = await client.listSiteDeploys({ site_id: siteID, per_page: 15, page: page++ })
    if (!deploys.length) break
    deploy = deploys.find(({ deploy_ssl_url }) => deploy_ssl_url.startsWith(marker))
  }
  return deploy
}

function retryDeploy (client, deploy) {
  return fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/retry`, { method: 'POST', headers: client.defaultHeaders })
}

module.exports = __webpack_exports__;
/******/ })()
;