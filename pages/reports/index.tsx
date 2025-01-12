import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ReportGenerator from '@/components/reports/ReportGenerator'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  
  if (session?.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {}
  }
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async (type: string, filters: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, filters }),
      })

      if (!response.ok) throw new Error('Failed to generate report')

      // Handle PDF download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Generate Reports
        </h1>
        <ReportGenerator
          onGenerate={handleGenerateReport}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  )
} 