const core = require('@actions/core')
const { context } = require('@actions/github')
const fetch = require('node-fetch')
const Netlify = require('netlify')

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
