/**
 * EduBranch AI — Admin Error Mapping Helper
 *
 * Maps HTTP error status or network conditions to i18n keys under `g6.noData.*`.
 *  - 403: `g6.noData.forbidden`
 *  - 404, 501: `g6.noData.apiUnavailable` (admin endpoint not yet implemented / available)
 *  - 500-599: `g6.noData.serverError`
 *  - Network error / unreachable: `g6.noData.networkError`
 */

export function mapAdminHttpErrorToKey(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { status?: number };
      status?: number;
      code?: string;
    };
    const status = err.response?.status ?? err.status;

    if (status === 403) {
      return "g6.noData.forbidden";
    }
    if (status === 404 || status === 501) {
      return "g6.noData.apiUnavailable";
    }
    if (status !== undefined && status >= 500 && status < 600) {
      return "g6.noData.serverError";
    }
    if (err.code === "ERR_NETWORK" || !err.response) {
      return "g6.noData.networkError";
    }
  }
  return "g6.noData.serverError";
}
