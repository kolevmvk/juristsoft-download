export async function getServerSideProps() {
  return { redirect: { destination: '/apps', permanent: false } };
}
export default function Home() { return null; }
