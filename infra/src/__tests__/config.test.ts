import { describe, it, expect } from 'vitest'
import {
  SQL_CONFIG,
  WIF_CONFIG,
  CLOUD_RUN_SA_BINDINGS,
  CLOUD_RUN_SA_ROLES,
  GCP_REGION,
  IAM_ROLES,
} from '../config'

describe('Cloud SQL', () => {
  it('uses PostgreSQL as the database engine', () => {
    expect(SQL_CONFIG.databaseVersion).toMatch(/^POSTGRES_/)
  })
})

describe('Cloud Run service account — least-privilege', () => {
  it('grants exactly two roles', () => {
    expect(CLOUD_RUN_SA_BINDINGS).toHaveLength(2)
  })

  it('includes the Cloud SQL client role', () => {
    expect(CLOUD_RUN_SA_ROLES).toContain(IAM_ROLES.cloudSqlClient)
  })

  it('includes the Secret Manager Secret Accessor role', () => {
    expect(CLOUD_RUN_SA_ROLES).toContain(IAM_ROLES.secretManagerAccessor)
  })

  it('does not include any broad admin, editor, or owner roles', () => {
    const forbidden = ['roles/owner', 'roles/editor', 'roles/iam.admin', 'roles/admin']
    for (const role of CLOUD_RUN_SA_ROLES) {
      expect(forbidden).not.toContain(role)
    }
  })

  it('uses unique Pulumi resource names for each binding', () => {
    const names = CLOUD_RUN_SA_BINDINGS.map((b) => b.resourceName)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('Workload Identity Federation', () => {
  it('targets the joss-bleach/scout GitHub repository', () => {
    expect(WIF_CONFIG.githubRepo).toBe('joss-bleach/scout')
  })

  it('uses the official GitHub Actions OIDC issuer URL', () => {
    expect(WIF_CONFIG.githubOidcIssuer).toBe('https://token.actions.githubusercontent.com')
  })
})

describe('GCP region', () => {
  it('is a syntactically valid GCP region string', () => {
    expect(GCP_REGION).toMatch(/^[a-z]+-[a-z]+\d+$/)
  })
})
