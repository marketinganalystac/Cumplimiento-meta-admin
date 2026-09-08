export default function middleware(request: Request) {
  const incomingSecret = request.headers.get("x-access-gate");
  const expectedSecret = process.env.ACCESS_GATE_SECRET;

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    return new Response("Acceso restringido", {
      status: 403,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return;
}
