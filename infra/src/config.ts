export const GCP_REGION = 'europe-west1' as const

export const SQL_CONFIG = {
  databaseVersion: 'POSTGRES_15' as const,
  tier: 'db-f1-micro' as const,
} as const

export const CLOUD_RUN_CONFIG = {
  placeholderImage: 'us-docker.pkg.dev/cloudrun/container/hello:latest' as const,
  memoryCap: '512Mi' as const,
  cpuCap: '1' as const,
} as const

export const ARTIFACT_REGISTRY_CONFIG = {
  repositoryId: 'scout-images' as const,
} as const

export const WIF_CONFIG = {
  poolId: 'scout-github-pool' as const,
  providerId: 'github-oidc' as const,
  githubOidcIssuer: 'https://token.actions.githubusercontent.com' as const,
  githubRepo: 'joss-bleach/scout' as const,
} as const

export const IAM_ROLES = {
  cloudSqlClient: 'roles/cloudsql.client' as const,
  secretManagerAccessor: 'roles/secretmanager.secretAccessor' as const,
} as const

// Exhaustive list of roles granted to the Cloud Run service account.
// Must remain exactly these two — no admin, editor, or owner roles.
export const CLOUD_RUN_SA_ROLES = [
  IAM_ROLES.cloudSqlClient,
  IAM_ROLES.secretManagerAccessor,
] as const

export const SECRET_NAMES = {
  dbConnectionString: 'scout-db-connection-string' as const,
} as const

export const FIREBASE_CONFIG = {
  siteId: 'scout-web' as const,
} as const

export const RESOURCE_NAMES = {
  sqlInstance: 'scout-db' as const,
  sqlDatabase: 'scout' as const,
  artifactRepo: 'scout-images' as const,
  runServiceAccount: 'scout-run-sa' as const,
  cloudRunService: 'scout-api' as const,
  hostingSite: 'scout-hosting' as const,
  wifPool: 'scout-github-pool' as const,
  wifProvider: 'scout-github-provider' as const,
} as const
