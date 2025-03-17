import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { 
  ChartBarIcon, 
  CubeIcon, 
  ShoppingCartIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <>
      <Head>
        <title>Welcome to MALI(POS) - Track It. Grow It.</title>
        <meta name="description" content="MALI(POS) - Your complete point of sale and inventory management solution" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <CubeIcon className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-indigo-600">MALI(POS)</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CubeIcon className="h-16 w-16 text-indigo-600" />
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Track It.</span>
                <span className="block text-indigo-600">Grow It.</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Your complete point of sale and inventory management solution. 
                Built to help your business thrive.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <CubeIcon className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
                </div>
                <p className="text-gray-500">
                  Track stock levels, manage products, and get alerts for low inventory.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <ShoppingCartIcon className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Sales Tracking</h3>
                </div>
                <p className="text-gray-500">
                  Monitor sales performance, generate invoices, and manage customer relationships.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Business Analytics</h3>
                </div>
                <p className="text-gray-500">
                  Make data-driven decisions with powerful analytics and reporting tools.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ArrowTrendingUpIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Ready to grow your business?
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Join successful businesses already using MALI(POS).
              </p>
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get started
                  </Link>
                </div>
                <div className="ml-3 inline-flex">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} MALI(POS). All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}