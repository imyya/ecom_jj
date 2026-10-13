import { cancelExpiredOrders } from "@/features/order/services/server";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const cancelled = await cancelExpiredOrders();
  return Response.json({ cancelled });
}
