import type { Metadata } from "next";
import Link from "next/link";

import { LimsProjectDetailClient } from "@/components/pathx/lims-project-detail-client";
import { Button } from "@/components/ui/button";
import { getLimsProjectDetailAction } from "@/lib/lims/get-lims-project-detail-action";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const res = await getLimsProjectDetailAction(id);
  if (!res.ok) return { title: "Project | PathX" };
  return {
    title: `${res.data.project_reference} | LIMS | PathX`,
    description: "LIMS project detail, samples, and slides.",
  };
}

export default async function LimsProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getLimsProjectDetailAction(id);

  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm text-destructive">{res.error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/pathx/lims/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  return <LimsProjectDetailClient initial={res.data} />;
}
