import { test } from 'node:test'
import assert from 'node:assert/strict'
import { repositoryUrl } from '../src/utils/repositoryUrl.ts'

test('normalizes pasted GitHub repository URLs', () => {
  for (const input of ['github.com/owner/repo', 'https://github.com/owner/repo/', ' https://github.com/owner/repo.git ', 'https://github.com/owner/repo?tab=readme-ov-file#readme']) {
    assert.equal(repositoryUrl(input), 'https://github.com/owner/repo')
  }
})

test('rejects other hosts, incomplete URLs, file paths, and credentials', () => {
  for (const input of ['', 'https://example.com/owner/repo', 'https://github.com.evil.test/owner/repo', 'https://github.com/owner', 'https://github.com/owner/repo/tree/main', 'http://github.com/owner/repo', 'https://user:secret@github.com/owner/repo', 'https://github.com:9000/owner/repo', 'https://github.com/owner/.git']) {
    assert.equal(repositoryUrl(input), null, input)
  }
})
