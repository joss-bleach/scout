import { describe, it, expect } from 'vitest'
import {
  SQL_CONFIG,
  WIF_CONFIG,
  CLOUD_RUN_SA_ROLES,
  CLOUD_RUN_CONFIG,
  GCP_REGION,
  FIREBASE_CONFIG,
  ARTIFACT_REGISTRY_CONFIG,
  SECRET_NAMES,
  IAM_ROLES,
} from '../config'

describe('Cloud SQL configuration', () => {
  it('uses PostgreSQL as the database engine', () => {
    expect(SQL_CONFIG.databaseVersion).toMatch(/^POSTGRES_/)
  })

  it('specifies a compute tier', () => {
    expect(SQL_CONFIG.tier).toBeTruthy()
  })
})

describe('Cloud Run IAM — least-privilege', () => {
  it('grants exactly two roles to the Cloud Run service account', () => {
    expect(CLOUD_RUN_SA_ROLES).toHaveLength(2)
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
})

describe('Workload Identity Federation', () => {
  it('targets the joss-bleach/scout GitHub repository', () => {
    expect(WIF_CONFIG.githubRepo).toBe('joss-bleach/scout')
  })

  it('uses the official GitHub Actions OIDC issuer URL', () => {
    expect(WIF_CONFIG.githubOidcIssuer).toBe('https://token.actions.githubusercontent.com')
  })

  it('has a non-empty WIF pool ID', () => {
    expect(WIF_CONFIG.poolId.length).toBeGreaterThan(0)
  })

  it('has a non-empty WIF provider ID', () => {
    expect(WIF_CONFIG.providerId.length).toBeGreaterThan(0)
  })
})

describe('Cloud Run configuration', () => {
  it('specifies a placeholder image for initial deployment', () => {
    expect(CLOUD_RUN_CONFIG.placeholderImage).toBeTruthy()
  })
})

describe('GCP region', () => {
  it('is set to a valid GCP region string', () => {
    expect(GCP_REGION).toMatch(/^[a-z]+-[a-z]+\d+$/)
  })
})

describe('Firebase Hosting configuration', () => {
  it('has a non-empty site ID', () => {
    expect(FIREBASE_CONFIG.siteId.length).toBeGreaterThan(0)
  })
})

describe('Artifact Registry configuration', () => {
  it('has a non-empty repository ID', () => {
    expect(ARTIFACT_REGISTRY_CONFIG.repositoryId.length).toBeGreaterThan(0)
  })
})

describe('Secret Manager configuration', () => {
  it('has a secret name for the database connection string', () => {
    expect(SECRET_NAMES.dbConnectionString.length).toBeGreaterThan(0)
  })
})
