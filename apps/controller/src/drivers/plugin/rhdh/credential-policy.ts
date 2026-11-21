import type {
  CredentialSource,
  PluginDeploymentNetworkRequirement,
} from "@openclaw-enterprise/contracts";
import type { ManagedCliInstall, ManagedCredentialSlot } from "../managed-catalog.ts";

/**
 * RHDH connector semantics: one static bearer token scoped to one RHDH instance.
 *
 * The reachable endpoint is not fixed by the release: it follows the bound
 * credential source's endpoint configuration (bearer-token host, port and
 * path), so one plugin release serves any RHDH deployment. The plugin declares
 * no credential-free routes: every catalog request presents the token.
 */
export const rhdhCredentialPolicy = {
  packageName: "oce-rhdh",
  deploymentNetworks(install: ManagedCliInstall): {
    networkOnly: readonly PluginDeploymentNetworkRequirement[];
    credential: readonly PluginDeploymentNetworkRequirement[];
  } {
    void install;
    return { networkOnly: [], credential: [] };
  },
  accepts(
    install: ManagedCliInstall,
    slot: ManagedCredentialSlot,
    source: CredentialSource,
  ): boolean {
    return (
      source.state === "ready" &&
      source.ownerCapability === "credential_gateway" &&
      source.egress === undefined &&
      source.type === "bearer-token" &&
      source.config.env_var === slot.delivery.env &&
      (source.config.binary === undefined || source.config.binary === install.binaryPath)
    );
  },
  conflict(selected: CredentialSource, sources: readonly CredentialSource[]): string | undefined {
    if (
      sources.some(
        (source) => source.id !== selected.id && source.config.env_var === selected.config.env_var,
      )
    ) {
      return "This RHDH plugin binding conflicts with another attached credential using the same token environment variable. Use a distinct env_var or clear the plugin binding.";
    }
    return undefined;
  },
};
