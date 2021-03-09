#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

const { Octokit } = require('@octokit/rest')

// See Examples above to learn about these command line arguments.
const [TAG_NAME, BOOL_CREATE_RELEASE] = process.argv.slice(2)

if (!BOOL_CREATE_RELEASE) {
  console.log(
    '\nRunning script in Dry Run mode. It will output details, will create a draft release but will NOT publish it.',
  )
}

const GH_OWNER = 'ThoughtWorks-Cleantech'
const GH_REPO = 'cloud-carbon-footprint'
const EXPECTED_COMMIT_MESSAGE = 'Version Packages'

// Initialize a GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// Get the message of the commit responsible for a tag
async function getCommitMessageUsingTagName(tagName) {
  console.log('###tagName', tagName)
  // Get the tag SHA using the provided tag name
  const refData = await octokit.git.getRef({
    owner: GH_OWNER,
    repo: GH_REPO,
    ref: `tags/${tagName}`,
  })
  if (refData.status !== 200) {
    console.error('refData:')
    console.error(refData)
    throw new Error(
      'Something went wrong when getting the tag SHA using tag name',
    )
  }
  const tagSha = refData.data.object.sha
  console.log(`SHA for the tag ${TAG_NAME} is ${tagSha}`)

  // Get the commit SHA using the tag SHA
  const tagData = await octokit.git.getTag({
    owner: GH_OWNER,
    repo: GH_REPO,
    tag_sha: tagSha,
  })
  if (tagData.status !== 200) {
    console.error('tagData:')
    console.error(tagData)
    throw new Error(
      'Something went wrong when getting the commit SHA using tag SHA',
    )
  }
  const commitSha = tagData.data.object.sha
  console.log(
    `The commit for the tag is https://github.com/ThoughtWorks-Cleantech/backstage/commit/${commitSha}`,
  )

  // Get the commit message using the commit SHA
  const commitData = await octokit.git.getCommit({
    owner: GH_OWNER,
    repo: GH_REPO,
    commit_sha: commitSha,
  })
  if (commitData.status !== 200) {
    console.error('commitData:')
    console.error(commitData)
    throw new Error(
      'Something went wrong when getting the commit message using commit SHA',
    )
  }

  // Example Commit Message
  // Merge pull request #3555 from backstage/changeset-release/master Version Packages
  return commitData.data.message
}

// There is a PR number in our expected commit message. Get the description of that PR.
async function getReleaseDescriptionFromCommitMessage(commitMessage) {
  // It should exactly match the pattern of changeset commit message, or else will abort.
  const expectedMessage = RegExp(EXPECTED_COMMIT_MESSAGE)
  if (!expectedMessage.test(commitMessage)) {
    throw new Error(
      `Expected regex did not match commit message: ${commitMessage}`,
    )
  }

  console.log('###commitMessage', commitMessage)
  console.log('###commitMessage', expectedMessage)
  onsole.log('###commitMessage', commitMessage.match(expectedMessage))
  // Get the PR description from the commit message
  const prNumber = commitMessage.match(expectedMessage).groups.prNumber
  console.log(
    `Identified the changeset Pull request - https://github.com/backstage/cloud-carbon-footprint/pull/${prNumber}`,
  )

  const { data } = await octokit.pulls.get({
    owner: GH_OWNER,
    repo: GH_REPO,
    pull_number: prNumber,
  })

  console.log('###data', tagName)
  // Use the PR description to prepare for the release description
  const isChangesetRelease = commitMessage.includes(expectedMessage)
  if (isChangesetRelease) {
    return data.body.split('\n').slice(3).join('\n')
  }

  return data.body
}

// Create Release on GitHub.
async function createRelease(releaseDescription) {
  // Create draft release if BOOL_CREATE_RELEASE is undefined
  // Publish release if BOOL_CREATE_RELEASE is not undefined
  const boolCreateDraft = !BOOL_CREATE_RELEASE

  const releaseResponse = await octokit.repos.createRelease({
    owner: GH_OWNER,
    repo: GH_REPO,
    tag_name: TAG_NAME,
    name: TAG_NAME,
    body: releaseDescription,
    draft: boolCreateDraft,
    prerelease: false,
  })

  if (releaseResponse.status === 201) {
    if (boolCreateDraft) {
      console.log('Created draft release! Click Publish to notify users.')
    } else {
      console.log('Published release!')
    }
    console.log(releaseResponse.data.html_url)
  } else {
    console.error(releaseResponse)
    throw new Error('Something went wrong when creating the release.')
  }
}

async function main() {
  const commitMessage = await getCommitMessageUsingTagName(TAG_NAME)
  const releaseDescription = await getReleaseDescriptionFromCommitMessage(
    commitMessage,
  )

  await createRelease(releaseDescription)
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
