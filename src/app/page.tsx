import "./workspace.css";
import { RecruitmentWorkspace } from "@/components/workspace/recruitment-workspace";
import { getWorkspaceSnapshot } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const snapshot = await getWorkspaceSnapshot();
  return (
    <RecruitmentWorkspace
      key={JSON.stringify([
        firstParam(params.q),
        firstParam(params.vacancy),
        firstParam(params.candidate),
      ])}
      initialSnapshot={snapshot}
      initialQuery={firstParam(params.q)?.slice(0, 200) ?? ""}
      initialVacancyId={firstParam(params.vacancy)}
      initialCandidateId={firstParam(params.candidate)}
    />
  );
}
