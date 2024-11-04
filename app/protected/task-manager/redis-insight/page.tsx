export default async function Page() {
  return (
    <>
      <iframe
        src="/api/proxy/redisinsight"
        title="Redis Insights"
        height={"100%"}
        width={"100%"}
      />
    </>
  );
}
