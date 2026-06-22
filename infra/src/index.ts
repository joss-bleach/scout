import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'
import {
  GCP_REGION,
  SQL_CONFIG,
  CLOUD_RUN_CONFIG,
  ARTIFACT_REGISTRY_CONFIG,
  WIF_CONFIG,
  CLOUD_RUN_SA_BINDINGS,
  SECRET_NAMES,
  FIREBASE_CONFIG,
  RESOURCE_NAMES,
} from './config'
import { buildSaIamMemberArgs } from './iam'

const gcpConfig = new pulumi.Config('gcp')
const projectId = gcpConfig.require('project')

// ── 1. Cloud SQL PostgreSQL ──────────────────────────────────────────────────

const sqlInstance = new gcp.sql.DatabaseInstance(RESOURCE_NAMES.sqlInstance, {
  databaseVersion: SQL_CONFIG.databaseVersion,
  region: GCP_REGION,
  settings: {
    tier: SQL_CONFIG.tier,
    ipConfiguration: {
      ipv4Enabled: false,
    },
    backupConfiguration: {
      enabled: true,
    },
    deletionProtectionEnabled: false,
  },
  deletionProtection: false,
})

new gcp.sql.Database(RESOURCE_NAMES.sqlDatabase, {
  instance: sqlInstance.name,
  name: RESOURCE_NAMES.sqlDatabase,
})

// ── 2. Secret Manager — DB connection string ─────────────────────────────────

const dbSecret = new gcp.secretmanager.Secret(SECRET_NAMES.dbConnectionString, {
  secretId: SECRET_NAMES.dbConnectionString,
  replication: {
    auto: {},
  },
})

// ── 3. Artifact Registry — Docker images ─────────────────────────────────────

const artifactRepo = new gcp.artifactregistry.Repository(RESOURCE_NAMES.artifactRepo, {
  repositoryId: ARTIFACT_REGISTRY_CONFIG.repositoryId,
  format: 'DOCKER',
  location: GCP_REGION,
  description: 'Scout API Docker images',
})

// ── 4. Least-privilege Cloud Run service account ──────────────────────────────

const runServiceAccount = new gcp.serviceaccount.Account(RESOURCE_NAMES.runServiceAccount, {
  accountId: RESOURCE_NAMES.runServiceAccount,
  displayName: 'Scout Cloud Run Service Account',
})

for (const args of buildSaIamMemberArgs('placeholder', projectId, CLOUD_RUN_SA_BINDINGS)) {
  new gcp.projects.IAMMember(args.resourceName, {
    project: args.project,
    role: args.role,
    member: pulumi.interpolate`serviceAccount:${runServiceAccount.email}`,
  })
}

// ── 5. Cloud Run v2 service (placeholder image) ───────────────────────────────

const apiService = new gcp.cloudrunv2.Service(RESOURCE_NAMES.cloudRunService, {
  name: RESOURCE_NAMES.cloudRunService,
  location: GCP_REGION,
  template: {
    containers: [
      {
        image: CLOUD_RUN_CONFIG.placeholderImage,
        resources: {
          limits: {
            memory: CLOUD_RUN_CONFIG.memoryCap,
            cpu: CLOUD_RUN_CONFIG.cpuCap,
          },
        },
      },
    ],
    serviceAccount: runServiceAccount.email,
  },
  traffics: [
    {
      type: 'TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST',
      percent: 100,
    },
  ],
})

// Allow public (unauthenticated) access so the frontend can call the API
new gcp.cloudrunv2.ServiceIamMember('scout-api-invoker', {
  name: apiService.name,
  location: GCP_REGION,
  role: 'roles/run.invoker',
  member: 'allUsers',
})

// ── 6. Firebase Hosting site ──────────────────────────────────────────────────

const hostingSite = new gcp.firebase.HostingSite(RESOURCE_NAMES.hostingSite, {
  project: projectId,
  siteId: FIREBASE_CONFIG.siteId,
})

// ── 7. Workload Identity Federation for GitHub Actions ────────────────────────

const wifPool = new gcp.iam.WorkloadIdentityPool(RESOURCE_NAMES.wifPool, {
  workloadIdentityPoolId: WIF_CONFIG.poolId,
  displayName: 'Scout GitHub Actions Pool',
  description: 'Workload Identity pool for keyless GitHub Actions CI/CD',
  disabled: false,
})

const wifProvider = new gcp.iam.WorkloadIdentityPoolProvider(RESOURCE_NAMES.wifProvider, {
  workloadIdentityPoolId: wifPool.workloadIdentityPoolId,
  workloadIdentityPoolProviderId: WIF_CONFIG.providerId,
  displayName: 'GitHub OIDC Provider',
  oidc: {
    issuerUri: WIF_CONFIG.githubOidcIssuer,
  },
  attributeMapping: {
    'google.subject': 'assertion.sub',
    'attribute.repository': 'assertion.repository',
    'attribute.repository_owner': 'assertion.repository_owner',
    'attribute.ref': 'assertion.ref',
  },
  // Restrict tokens to only the scout repo — no other GitHub repo can impersonate
  attributeCondition: `assertion.repository == "${WIF_CONFIG.githubRepo}"`,
})

// ── Exports ───────────────────────────────────────────────────────────────────

export const sqlInstanceName = sqlInstance.name
export const artifactRegistryRepo = artifactRepo.name
export const cloudRunUrl = apiService.uri
export const runServiceAccountEmail = runServiceAccount.email
export const wifPoolName = wifPool.name
export const wifProviderName = wifProvider.name
export const hostingSiteDefaultUrl = hostingSite.defaultUrl
export const dbSecretId = dbSecret.secretId
