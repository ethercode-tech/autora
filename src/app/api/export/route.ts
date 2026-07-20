import { NextResponse } from "next/server";
import { requireActiveAccount } from "@/lib/auth/session";
import { buildBusinessExportCsv, getBusinessExportPayload } from "@/server/queries/export";

export async function GET(request: Request) {
  await requireActiveAccount();

  const payload = await getBusinessExportPayload();
  const format = new URL(request.url).searchParams.get("format");
  const fileSafeBusinessName = (payload.profile?.business_name ?? "autora")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (format === "csv") {
    return new NextResponse(buildBusinessExportCsv(payload), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${fileSafeBusinessName || "autora"}-export.csv"`
      }
    });
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${fileSafeBusinessName || "autora"}-export.json"`
    }
  });
}
