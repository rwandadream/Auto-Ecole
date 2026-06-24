export async function GET() {
  return Response.json({
    status: 'ok',
    env: process.env.VERCEL_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  })
}
