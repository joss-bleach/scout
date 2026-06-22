export const GCP_REGION = 'europe-west1'

export const SQL_CONFIG = {
  databaseVersion: 'POSTGRES_15',
  tier: 'db-f1-micro',
} as const

export const CLOUD_RUN_CONFIG = {
  placeholderImage: 'us-docker.pkg.dev/cloudrun/container/hello:latest',
  memoryCap: '512Mi',
  cpuCap: '1',
} as const

export const ARTIFACT_REGISTRY_CONFIG = {
  repositoryId: 'scout-images',
} as const

export const WIF_CONFIG = {
  poolId: 'scout-github-pool',
  providerId: 'github-oidc',
  githubOidcIssuer: 'https://token.actions.githubusercontent.com',
  githubRepo: 'joss-bleach/scout',
} as const

export const IAM_ROLES = {
  cloudSqlClient: 'roles/cloudsql.client',
  secretManagerAccessor: 'roles/secretmanager.secretAccessor',
} as const

// Single source of truth for roles granted to the Cloud Run service account.
// Each entry produces an IAMMember in index.ts; the test in config.test.ts
// asserts no broad admin/editor/owner roles can be added without review.
export const CLOUD_RUN_SA_BINDINGS = [
  { resourceName: 'run-sa-sql-client', role: IAM_ROLES.cloudSqlClient },
  { resourceName: 'run-sa-secret-accessor', role: IAM_ROLES.secretManagerAccessor },
] as const

export const CLOUD_RUN_SA_ROLES: readonly string[] = CLOUD_RUN_SA_BINDINGS.map((b) => b.role)

export const SECRET_NAMES = {
  dbConnectionString: 'scout-db-connection-string',
} as const

export const FIREBASE_CONFIG = {
  siteId: 'scout-web',
} as const

export const RESOURCE_NAMES = {
  sqlInstance: 'scout-db',
  sqlDatabase: 'scout',
  artifactRepo: 'scout-images',
  runServiceAccount: 'scout-run-sa',
  cloudRunService: 'scout-api',
  hostingSite: 'scout-hosting',
  wifPool: 'scout-github-pool',
  wifProvider: 'scout-github-provider',
} as const
