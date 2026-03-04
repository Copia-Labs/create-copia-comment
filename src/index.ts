import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'

interface CommentPayload {
  body: string
}

interface CommentResponse {
  id: number
  html_url: string
  message?: string
}

async function run(): Promise<void> {
  try {
    // Read server URL: use input if provided, otherwise fall back to GITHUB_SERVER_URL
    const serverUrl = (
      core.getInput('server_url') || process.env.GITHUB_SERVER_URL || ''
    ).replace(/\/+$/, '')
    if (!serverUrl) {
      throw new Error(
        'server_url input or GITHUB_SERVER_URL environment variable must be set'
      )
    }
    const token = core.getInput('token', { required: true })
    const owner = core.getInput('owner', { required: true })
    const repo = core.getInput('repo', { required: true })
    const issueNumber = core.getInput('issue_number', { required: true })
    const body = core.getInput('body', { required: true })
    const commentId = core.getInput('comment_id')

    // Mask the token so it never appears in logs
    core.setSecret(token)

    // Create HTTP client with token auth
    const http = new HttpClient('create-copia-comment', [], {
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const payload: CommentPayload = { body }

    if (commentId) {
      // Update existing comment
      const url = `${serverUrl}/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/comments/${encodeURIComponent(commentId)}`
      core.info(`Updating comment ${commentId} in ${owner}/${repo}`)

      const response = await http.patchJson<CommentResponse>(url, payload)
      const statusCode = response.statusCode
      const result = response.result

      if (statusCode === 200 && result) {
        core.info(`Comment ${result.id} updated: ${result.html_url}`)
        core.setOutput('comment_id', result.id)
        core.setOutput('comment_url', result.html_url)
        core.setOutput('json', JSON.stringify(result))
      } else if (statusCode === 422) {
        const message = result?.message ?? 'unknown validation error'
        core.setFailed(`Validation failed: ${message}`)
      } else if (statusCode === 404) {
        core.setFailed(
          'Not found — verify owner, repo, comment ID, and token permissions'
        )
      } else if (statusCode === 403) {
        core.setFailed(
          'Forbidden — comment may be on a locked issue or token has insufficient permissions'
        )
      } else if (statusCode === 401) {
        core.setFailed(
          'Authentication failed — verify token is valid and has sufficient permissions'
        )
      } else {
        core.setFailed(`Unexpected API response: HTTP ${statusCode}`)
      }
    } else {
      // Create new comment
      const url = `${serverUrl}/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${encodeURIComponent(issueNumber)}/comments`
      core.info(
        `Creating comment on issue #${issueNumber} in ${owner}/${repo}`
      )

      const response = await http.postJson<CommentResponse>(url, payload)
      const statusCode = response.statusCode
      const result = response.result

      if (statusCode === 201 && result) {
        core.info(`Comment ${result.id} created: ${result.html_url}`)
        core.setOutput('comment_id', result.id)
        core.setOutput('comment_url', result.html_url)
        core.setOutput('json', JSON.stringify(result))
      } else if (statusCode === 422) {
        const message = result?.message ?? 'unknown validation error'
        core.setFailed(`Validation failed: ${message}`)
      } else if (statusCode === 404) {
        core.setFailed(
          'Not found — verify owner, repo, issue number, and token permissions'
        )
      } else if (statusCode === 403) {
        core.setFailed(
          'Forbidden — issue may be locked or token has insufficient permissions'
        )
      } else if (statusCode === 401) {
        core.setFailed(
          'Authentication failed — verify token is valid and has sufficient permissions'
        )
      } else {
        core.setFailed(`Unexpected API response: HTTP ${statusCode}`)
      }
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
