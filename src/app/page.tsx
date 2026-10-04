import { RecruitmentWorkspace } from "@/components/workspace/recruitment-workspace";
import { getWorkspaceSnapshot } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getWorkspaceSnapshot();
  return <RecruitmentWorkspace initialSnapshot={snapshot} />;
}
