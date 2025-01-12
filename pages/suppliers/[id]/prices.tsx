import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SupplierPriceList from '@/components/suppliers/SupplierPriceList'
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'

interface SupplierPricesPageProps {
  supplierId: string
  prices: {
    id: string
    productId: string
    price: number
    product: {
      id: string
      name: string
    }
  }[]
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const supplierId = params?.id as string
  const prices = await prisma.supplierPrice.findMany({
    where: { supplierId },
    include: {
      product: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return {
    props: {
      supplierId,
      prices: JSON.parse(JSON.stringify(prices))
    }
  }
}

export default function SupplierPricesPage({ supplierId, prices }: SupplierPricesPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Wait for session loading
  if (status === 'loading') {
    return <div>Loading...</div>
  }

  // Only redirect on client side
  if (typeof window !== 'undefined' && !session) {
    router.push('/auth/login')
    return null
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Supplier Prices</h1>
        <div className="mt-8">
          <SupplierPriceList supplierId={supplierId} prices={prices} />
        </div>
      </div>
    </DashboardLayout>
  )
} 