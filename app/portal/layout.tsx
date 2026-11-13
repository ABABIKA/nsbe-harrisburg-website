import PortalShell from "../../components/portal/PortalShell";
import { verifySession } from "../../lib/auth/dal";

// Frame for every member page: sidebar, top bar, and the signed-in check.
// Each page also calls verifySession() itself, because layouts do not re-run
// on every navigation.
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();
  return <PortalShell user={user}>{children}</PortalShell>;
}
