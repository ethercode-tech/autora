import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/session";
import { getBusinessExportPayload } from "@/server/queries/export";

export async function GET() {
  await requireActiveAccount();

  const payload = await getBusinessExportPayload();
  const fileSafeBusinessName = (payload.profile?.business_name ?? "autora")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${fileSafeBusinessName || "autora"}-export.json"`
    }
  });
}
