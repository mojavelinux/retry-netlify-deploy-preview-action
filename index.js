const core = require('@actions/core')
const fetch = require('node-fetch')
const Netlify = require('netlify')

run()

async function run () {
  try {
    const client = new Netlify(core.getInput('netlify-token'))
    const siteID = core.getInput('site-id')
    const pullRequestID = core.getInput('pull-request-url').split('/').pop()
    const deploy = await findDeployForPullRequest(client, siteID, pullRequestID)
    if (deploy) await retryDeploy(client, deploy)
  } catch (err) {
    core.setFailed(err.message)
  }
}

async function findDeployForPullRequest (client, siteID, pullRequestID) {
  let deploy
  let page = 1
  const marker = `https://deploy-preview-${pullRequestID}--`
  while (deploy == null) {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteID}/deploys?per_page=15&page=${page++}`, { method: 'GET', headers: client.defaultHeaders })
    const deploys = JSON.parse(await response.text())
    if (!deploys.length) break
    deploy = deploys.find(({ deploy_ssl_url }) => deploy_ssl_url.startsWith(marker))
  }
  return deploy
}

async function retryDeploy (client, deploy) {
  return await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/retry`, { method: 'POST', headers: client.defaultHeaders })
}
