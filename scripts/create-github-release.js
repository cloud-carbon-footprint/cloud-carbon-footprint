#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

const { Octokit } = require('@octokit/rest')

// See Examples above to learn about these command line arguments.
const [TAG_NAME, BOOL_CREATE_RELEASE] = process.argv.slice(2)
// Add latest tag name to route release to latest tag
const LATEST_TAG_NAME = 'latest'

if (!BOOL_CREATE_RELEASE) {
  console.log(
    '\nRunning script in Dry Run mode. It will output details, will create a draft release but will NOT publish it.',
  )
}

const GH_OWNER = 'cloud-carbon-footprint'
const GH_REPO = 'cloud-carbon-footprint'
const EXPECTED_COMMIT_MESSAGE = /^Merge pull request #(?<prNumber>[0-9]+) from/
const CHANGESET_RELEASE_BRANCH =
  'cloud-carbon-footprint/changeset-release/trunk'

// Initialize a GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// Get the message of the commit responsible for a tag
async function getCommitMessageUsingTagName(tagName) {
  // Get the tag SHA using the provided tag name
  const refData = await octokit.git.getRef({
    owner: GH_OWNER,
    repo: GH_REPO,
    ref: `tags/${tagName}`,
  })
  if (refData.status !== 200) {
    console.error('refData:')
    console.error(refData)
    await deletePreviousTag(TAG_NAME)
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
    await deletePreviousTag(TAG_NAME)
    throw new Error(
      'Something went wrong when getting the commit SHA using tag SHA',
    )
  }
  const commitSha = tagData.data.object.sha
  console.log(
    `The commit for the tag is https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/commit/${commitSha}`,
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
    await deletePreviousTag(TAG_NAME)
    throw new Error(
      'Something went wrong when getting the commit message using commit SHA',
    )
  }

  // Example Commit Message
  // Merge pull request #3555 from cloud-carbon-footprint/changeset-release/master Version Packages
  return commitData.data.message
}

// There is a PR number in our expected commit message. Get the description of that PR.
async function getReleaseDescriptionFromCommitMessage(commitMessage) {
  // It should exactly match the pattern of changeset commit message, or else will abort.
  const expectedMessage = RegExp(EXPECTED_COMMIT_MESSAGE)
  if (!expectedMessage.test(commitMessage)) {
    await deletePreviousTag(TAG_NAME)
    throw new Error(
      `Expected regex did not match commit message: ${commitMessage}`,
    )
  }

  // Get the PR description from the commit message
  const prNumber = commitMessage.match(expectedMessage).groups.prNumber
  console.log(
    `Identified the changeset Pull request - https://github.com/cloud-carbon-footprint/cloud-carbon-footprint/pull/${prNumber}`,
  )

  const { data } = await octokit.pulls.get({
    owner: GH_OWNER,
    repo: GH_REPO,
    pull_number: prNumber,
  })

  // Use the PR description to prepare for the release description
  const isChangesetRelease = commitMessage.includes(CHANGESET_RELEASE_BRANCH)
  if (isChangesetRelease) {
    return data.body.split('\n').slice(3).join('\n')
  }

  return data.body
}

// Create Release on GitHub.
async function createRelease(releaseDescription, prevReleaseId) {
  // Create draft release if BOOL_CREATE_RELEASE is undefined
  // Publish release if BOOL_CREATE_RELEASE is not undefined
  const boolCreateDraft = !BOOL_CREATE_RELEASE

  const releaseResponse = await octokit.repos.createRelease({
    owner: GH_OWNER,
    repo: GH_REPO,
    tag_name: LATEST_TAG_NAME,
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
    await deletePreviousTag(TAG_NAME)
    await updatePreviousRelease(prevReleaseId, LATEST_TAG_NAME)
    throw new Error('Something went wrong when creating the release.')
  }
}

// Get previous release info on GitHub.
async function getPreviousRelease() {
  const prevRelease = await octokit.rest.repos.getReleaseByTag({
    owner: GH_OWNER,
    repo: GH_REPO,
    tag: LATEST_TAG_NAME,
  })

  if (prevRelease.status === 200) {
    console.log('Got Previous release!')
    console.log(prevRelease.data.html_url)
  } else {
    console.error(prevRelease)
    await deletePreviousTag(TAG_NAME)
    throw new Error('Something went wrong when fetching the previous release.')
  }

  return { id: prevRelease.data.id, name: prevRelease.data.name }
}

// Update previous latest release on GitHub to refer to tag created with same name.
async function updatePreviousRelease(id, name) {
  const updateResponse = await octokit.repos.updateRelease({
    owner: GH_OWNER,
    repo: GH_REPO,
    release_id: id,
    tag_name: name,
  })

  if (updateResponse.status === 200) {
    console.log('Updated Previous Release!')
    console.log(updateResponse.data.html_url)
  } else {
    console.error(updateResponse)
    await deletePreviousTag(TAG_NAME)
    throw new Error('Something went wrong when updating the previous release.')
  }
}

// Revert the latest ref and update git sha if create new release fails
async function revertLatestRef() {
  const existingTags = await octokit.repos.listTags({
    owner: GH_OWNER,
    repo: GH_REPO,
    per_page: 5,
  })

  const updatedExistingTags = existingTags.data.filter(
    (obj) => obj.name != 'latest',
  )

  const latestRefSha = updatedExistingTags[0].commit.sha

  const updateRefResponse = await octokit.rest.git.updateRef({
    owner: GH_OWNER,
    repo: GH_REPO,
    ref: 'tags/latest',
    sha: latestRefSha,
  })

  if (updateRefResponse.status === 200) {
    console.log('Reverted previous tag ref!')
  } else {
    console.error(updateRefResponse)
    throw new Error('Something went wrong when reverting the previous tag ref.')
  }
}

// Delete the newly created tag if create new release fails
async function deletePreviousTag(name) {
  const deleteResponse = await octokit.rest.git.deleteRef({
    owner: GH_OWNER,
    repo: GH_REPO,
    ref: `tags/${name}`,
  })

  if (deleteResponse.status === 204) {
    console.log('Deleted Newly Created Tag!')
  } else {
    console.error(deleteResponse)
    throw new Error('Something went wrong when deleting the newly created tag.')
  }

  await revertLatestRef()
}

async function main() {
  const commitMessage = await getCommitMessageUsingTagName(TAG_NAME)
  const releaseDescription = await getReleaseDescriptionFromCommitMessage(
    commitMessage,
  )

  const prevReleaseId = await getPreviousRelease()
  await updatePreviousRelease(prevReleaseId.id, prevReleaseId.name)
  await createRelease(releaseDescription, prevReleaseId.id)
}

main().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
