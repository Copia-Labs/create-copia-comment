# Create Copia Comment

A GitHub Action that creates or updates a comment on an issue/PR on a [Copia](https://app.copia.io) instance via the REST API.

Works on both Copia-hosted and self-hosted runners — only requires the Node.js runtime.

## Usage

### Create a Comment

```yaml
- uses: Copia-Labs/create-copia-comment@v1
  with:
    token: ${{ secrets.COPIA_TOKEN }}
    owner: my-org
    repo: my-project
    issue_number: '42'
    body: 'This is an automated comment from CI.'
```

### Update an Existing Comment

```yaml
- uses: Copia-Labs/create-copia-comment@v1
  with:
    token: ${{ secrets.COPIA_TOKEN }}
    owner: my-org
    repo: my-project
    issue_number: '42'
    body: 'Updated comment body.'
    comment_id: '123'
```

### Full Example

```yaml
- uses: Copia-Labs/create-copia-comment@v1
  id: comment
  with:
    server_url: https://app.copia.io # optional override
    token: ${{ secrets.COPIA_TOKEN }}
    owner: my-org
    repo: my-project
    issue_number: '42'
    body: |
      Automated comment from CI.

      Workflow: ${{ github.workflow }}
      Run: ${{ github.run_id }}

- name: Print comment URL
  run: echo "Comment URL ${{ steps.comment.outputs.comment_url }}"
```

## Inputs

| Name           | Required | Default                    | Description                                                                                            |
| -------------- | -------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `token`        | yes      | —                          | Personal access token                                                                                  |
| `owner`        | yes      | —                          | Repository owner (user or organization)                                                                |
| `repo`         | yes      | —                          | Repository name                                                                                        |
| `issue_number` | yes      | —                          | Issue or pull request index                                                                            |
| `body`         | yes      | —                          | Comment body text                                                                                      |
| `comment_id`   | no       | `''`                       | If provided, updates this comment instead of creating a new one                                        |
| `server_url`   | no       | `<URL of workflow origin>` | Base URL of the Copia instance. Defaults to the URL of the server where the workflow was started from. |

## Outputs

| Name          | Description                              |
| ------------- | ---------------------------------------- |
| `comment_id`  | The ID of the created or updated comment |
| `comment_url` | The HTML URL of the comment              |
| `json`        | The full JSON API response               |

## Error Handling

The action fails with a descriptive message for common API errors:

| HTTP Status | Meaning                                               |
| ----------- | ----------------------------------------------------- |
| 422         | Validation failed                                     |
| 404         | Repository, issue, or comment not found               |
| 403         | Issue is locked or token has insufficient permissions |
| 401         | Authentication failed                                 |

## Development

```bash
npm install
npm run build    # bundles dist/index.js via ncc
```

The `dist/` directory is committed to the repository so the action runs without an install step.
