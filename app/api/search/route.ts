import { searchTrips } from "@/lib/api/search";
import { parseTripQuery } from "@/lib/query";

/** NDJSON stream so the results page can reveal hacks one by one. */
export async function GET(request: Request) {
  const query = parseTripQuery(new URL(request.url).searchParams);
  if (!query) {
    return Response.json({ error: "Add a route before searching." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const option of searchTrips(query)) {
          controller.enqueue(encoder.encode(`${JSON.stringify(option)}\n`));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
