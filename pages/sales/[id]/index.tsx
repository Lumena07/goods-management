import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SaleDetail from '@/components/sales/SaleDetail'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Sale {
  id: string
  isAccredited: boolean
  // ... other fields
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  const sale = await prisma.sale.findUnique({
    where: { id: String(context.params?.id) },
    include: {
      customer: true,
      items: {
        include: {
          product: true
        }
      },
      payments: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!sale) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      sale: JSON.parse(JSON.stringify(sale))
    }
  }
}

export default function SaleDetailPage({ sale }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Sale Details</h1>
            <div className="mt-4 sm:mt-0 space-x-3">
              {sale?.isAccredited && (
                <Link
                  href={`/sales/${sale.id}/invoice`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Invoice
                </Link>
              )}
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        <SaleDetail sale={sale} />
      </div>
    </DashboardLayout>
  )
} 