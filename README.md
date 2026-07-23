# Create Copia Comment

A GitHub Action that creates or updates a comment on an issue on a [Copia](https://app.copia.io) instance via the REST API.

Works on both Copia-hosted and self-hosted runners — only requires the Node.js runtime.

## Usage

### Create a Comment

```yaml
permissions:
  issues: write  # needed if the default permissions are Restricted
steps:
  - uses: Copia-Labs/create-copia-comment@v1.1.0
    with:
      owner: my-org
      repo: my-project
      issue_number: '42'
      body: 'This is an automated comment from CI.'

```

### Update an Existing Comment

```yaml
permissions:
  issues: write  # needed if the default permissions are Restricted
steps:
  - uses: Copia-Labs/create-copia-comment@v1.1.0
    with:
      owner: my-org
      repo: my-project
      issue_number: '42'
      body: 'Updated comment body.'
      comment_id: '123'
```

### Full Example

```yaml
permissions:
  issues: write  # needed if the default permissions are Restricted
steps:
  - uses: Copia-Labs/create-copia-comment@v1.1.0
    id: comment
    with:
      server_url: https://app.copia.io # optional override
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
| `owner`        | yes      | —                          | Repository organization                                                                                |
| `repo`         | yes      | —                          | Repository name                                                                                        |
| `issue_number` | yes      | —                          | Issue index                                                                                            |
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
