#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

const { Octokit } = require('@octokit/rest')

const baseOptions = {
  owner: 'cloud-carbon-footprint',
  repo: 'cloud-carbon-footprint',
}

async function main() {
  const { GITHUB_SHA, GITHUB_TOKEN } = process.env
  if (!GITHUB_SHA) {
    throw new Error('GITHUB_SHA is not set')
  }
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not set')
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN })

  const date = new Date()
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  const baseTagName = `release-${yyyy}-${mm}-${dd}`

  console.log('Requesting existing tags')

  const existingTags = await octokit.repos.listTags({
    ...baseOptions,
    per_page: 100,
  })
  const existingTagNames = existingTags.data.map((obj) => obj.name)

  let tagName = baseTagName
  let index = 0
  while (existingTagNames.includes(tagName)) {
    index += 1
    tagName = `${baseTagName}.${index}`
  }

  console.log(`Creating release tag ${tagName}`)

  const annotatedTag = await octokit.git.createTag({
    ...baseOptions,
    tag: tagName,
    message: tagName,
    object: GITHUB_SHA,
    type: 'commit',
  })

  await octokit.git.createRef({
    ...baseOptions,
    ref: `refs/tags/${tagName}`,
    sha: annotatedTag.data.sha,
  })

  console.log(`::set-output name=tag_name::${tagName}`)
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
