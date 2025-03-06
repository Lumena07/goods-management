// Simple redirect to login page
export default function Home() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: '/auth/login',
      permanent: false,
    },
  };
}