import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CompanyHeader from './CompanyHeader';

interface Invoice {
  id: string;
  invoiceNumber?: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  customerEmail: string;
  invoiceAmount: string; // ✅ Added price
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://backend-billing-j81u.onrender.com/api/invoices/customer`, {
          params: { email: user.email },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
    
        setInvoices(response.data.invoices || []);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch invoices.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader variant="minimal" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-12 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Table */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price (₹)</th> {/* ✅ */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.invoiceNumber || invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        invoice.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.paymentStatus === 'Partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : invoice.paymentStatus === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.customerEmail}</td>
                 <td className="px-6 py-4 text-sm text-gray-900">
{invoice.invoiceAmount ? `₹${parseFloat(invoice.invoiceAmount).toFixed(2)}` : 'N/A'}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12 text-gray-600">No invoices found for your account.</div>
        )}
      </main>
    </div>
  );
}
