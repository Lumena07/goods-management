import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Add getServerSideProps to pre-fetch session
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/auth/login',
      permanent: false,
    },
  };
}

// The component itself will never be rendered because we always redirect
export default function Home() {
  // Server-side redirect
  return null;
}