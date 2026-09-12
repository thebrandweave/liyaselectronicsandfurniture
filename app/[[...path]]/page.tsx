import Shop from "@/components/shop";
export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  return <Shop path={path || []} />;
}
