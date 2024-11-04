export default async function Page() {
  return (
    <>
      <iframe
        src="/api/proxy/grafana/"
        title="Grafana"
        height={"100%"}
        width={"100%"}
      />
    </>
  );
}
