export default async function Page() {
  return (
    <>
      <iframe src="/api/proxy/prometheus" title="Prometheus" height={'100%'} width={'100%'}/>
    </>
  );
}
