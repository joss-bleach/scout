import type { CLOUD_RUN_SA_BINDINGS } from './config'

export interface IamMemberArgs {
  readonly resourceName: string
  readonly project: string
  readonly role: string
  readonly member: string
}

export function buildSaIamMemberArgs(
  saEmail: string,
  project: string,
  bindings: typeof CLOUD_RUN_SA_BINDINGS,
): readonly IamMemberArgs[] {
  return bindings.map(({ resourceName, role }) => ({
    resourceName,
    project,
    role,
    member: `serviceAccount:${saEmail}`,
  }))
}
