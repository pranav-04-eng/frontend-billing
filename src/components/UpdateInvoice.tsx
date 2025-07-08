import React, { useState } from 'react';
import { useInvoices } from '../contexts/InvoiceContext';
import { Search, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function UpdateInvoice() {
  const { searchInvoice, updateInvoice } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    dueDate: '',
    paymentStatus: 'Unpaid' as 'Paid' | 'Unpaid' | 'Partial' | 'Overdue',
    invoiceAmount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) {
      setErrors({ search: 'Please enter an invoice number' });
      setSelectedInvoice(null);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const invoice = await searchInvoice(trimmedTerm);
      if (invoice) {
        setSelectedInvoice(invoice);
        setFormData({
          dueDate: invoice.dueDate?.split('T')[0] || '',
          paymentStatus: invoice.paymentStatus || 'Unpaid',
          invoiceAmount: invoice.invoiceAmount?.toString() || '',
        });
      } else {
        setErrors({ search: 'Invoice not found' });
        setSelectedInvoice(null);
      }
    } catch (error) {
      setErrors({ search: 'Error fetching invoice' });
      setSelectedInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (!formData.invoiceAmount || isNaN(Number(formData.invoiceAmount))) {
      newErrors.invoiceAmount = 'Valid invoice amount is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    if (!validateForm() || !selectedInvoice) return;

    setLoading(true);
    try {
      const updateData = {
        dueDate: formData.dueDate,
        paymentStatus: formData.paymentStatus,
        invoiceAmount: parseFloat(formData.invoiceAmount),
      };
      const success = await updateInvoice(selectedInvoice.id, updateData);
      if (success) {
        setSuccess(true);
        const updatedInvoice = await searchInvoice(selectedInvoice.invoiceNumber);
        if (updatedInvoice) setSelectedInvoice(updatedInvoice);
      }
    } catch (error) {
      setErrors({ submit: 'Error updating invoice' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-4xl grid-cols-1 gap-x-6 gap-y-8">
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900">Update Invoice</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Search by invoice number and update the due date, payment status, or amount.
              </p>
            </div>

            {/* Search Field */}
            <div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-900">
                    Invoice Number
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      placeholder="e.g., INV-2024-001"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
              {errors.search && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{errors.search}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Details and Form */}
            {selectedInvoice && (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Current Invoice Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Invoice Number</p>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Customer Email</p>
                      <p className="text-sm text-gray-900">{selectedInvoice.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Invoice Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedInvoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                        selectedInvoice.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                        selectedInvoice.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedInvoice.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Amount (₹)</p>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoiceAmount}</p>
                    </div>
                  </div>
                </div>

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      <p className="text-sm text-green-700">Invoice updated successfully!</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    {/* Due Date */}
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900">Due Date *</label>
                      <input
                        type="date"
                        id="dueDate"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm ${
                          errors.dueDate ? 'ring-red-500' : 'ring-gray-300'
                        }`}
                      />
                      {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>}
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-900">
                        Payment Status
                      </label>
                      <select
                        id="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>

                    {/* Invoice Amount */}
                    <div>
                      <label htmlFor="invoiceAmount" className="block text-sm font-medium text-gray-900">
                        Invoice Amount (₹) *
                      </label>
                      <input
                        type="number"
                        id="invoiceAmount"
                        value={formData.invoiceAmount}
                        onChange={(e) => setFormData({ ...formData, invoiceAmount: e.target.value })}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm ${
                          errors.invoiceAmount ? 'ring-red-500' : 'ring-gray-300'
                        }`}
                        step="0.01"
                        min="0"
                      />
                      {errors.invoiceAmount && (
                        <p className="text-sm text-red-600 mt-1">{errors.invoiceAmount}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                        <p className="text-sm text-red-700">{errors.submit}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
