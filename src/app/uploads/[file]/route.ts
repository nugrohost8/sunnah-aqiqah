import { readFile } from "node:fs/promises";
import { UPLOAD_NAME_PATTERN, uploadFilePath } from "@/lib/uploads";

// Menyajikan gambar hasil upload admin dari storage/uploads.
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[file]">) {
  const { file } = await params;
  // Hanya nama file yang dibuat sendiri oleh saveImageUpload() — mencegah path traversal.
  if (!UPLOAD_NAME_PATTERN.test(file)) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(uploadFilePath(file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": file.endsWith(".png") ? "image/png" : "image/webp",
        // Nama file unik per upload, jadi aman di-cache selamanya.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
