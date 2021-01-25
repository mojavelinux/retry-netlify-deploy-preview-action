module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 116:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(296)
const { context } = __nccwpck_require__(120)
const fetch = __nccwpck_require__(804)
const Netlify = __nccwpck_require__(368)

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


/***/ }),

/***/ 296:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 120:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 368:
/***/ ((module) => {

module.exports = eval("require")("netlify");


/***/ }),

/***/ 804:
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
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
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
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(116);
/******/ })()
;