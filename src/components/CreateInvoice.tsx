import React, { useState } from 'react';
import axios from 'axios';
import CompanyHeader from './CompanyHeader';

const CreateInvoice: React.FC = () => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentStatus: 'Unpaid' as 'Paid' | 'Unpaid',
    invoiceAmount: '', // ✅ NEW field
  });

  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.invoiceNumber) newErrors.invoiceNumber = 'Invoice number is required';
    if (!formData.customerEmail) newErrors.customerEmail = 'Customer email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = 'Invalid email address';
    if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.paymentStatus) newErrors.paymentStatus = 'Payment status is required';
    if (!formData.invoiceAmount || isNaN(Number(formData.invoiceAmount))) {
      newErrors.invoiceAmount = 'Valid invoice amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const form = new FormData();
    form.append('invoiceNumber', formData.invoiceNumber);
    form.append('customerEmail', formData.customerEmail);
    form.append('invoiceDate', formData.invoiceDate);
    form.append('dueDate', formData.dueDate);
    form.append('paymentStatus', formData.paymentStatus);
    form.append('invoiceAmount', formData.invoiceAmount); // ✅ Append amount

    if (attachment) form.append('attachment', attachment);

    try {
      await axios.post('https://backend-billing-j81u.onrender.com/api/invoices', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccessMessage('Invoice created successfully!');
      setFormData({
        invoiceNumber: '',
        customerEmail: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        paymentStatus: 'Unpaid',
        invoiceAmount: '', // ✅ Clear amount
      });
      setAttachment(null);
      setErrors({});
    } catch (error) {
      console.error('Error creating invoice:', error);
      setSuccessMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-1">
        <CompanyHeader variant="minimal" className="rounded-md" />
      </div>
      
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
      {successMessage && <div className="text-green-600 mb-4">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Number */}
        <div>
          <label className="block font-medium text-sm">Invoice Number *</label>
          <input
            type="text"
            className={`w-full mt-1 p-2 border rounded ${errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          />
          {errors.invoiceNumber && <p className="text-red-600 text-sm mt-1">{errors.invoiceNumber}</p>}
        </div>

        {/* Customer Email */}
        <div>
          <label className="block font-medium text-sm">Customer Email *</label>
          <input
            type="email"
            className={`w-full mt-1 p-2 border rounded ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          />
          {errors.customerEmail && <p className="text-red-600 text-sm mt-1">{errors.customerEmail}</p>}
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block font-medium text-sm">Invoice Date *</label>
          <input
            type="date"
            className={`w-full mt-1 p-2 border rounded ${errors.invoiceDate ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.invoiceDate}
            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
          />
          {errors.invoiceDate && <p className="text-red-600 text-sm mt-1">{errors.invoiceDate}</p>}
        </div>

        {/* Due Date */}
        <div>
          <label className="block font-medium text-sm">Due Date *</label>
          <input
            type="date"
            className={`w-full mt-1 p-2 border rounded ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
          {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
        </div>

        {/* Payment Status */}
        <div>
          <label className="block font-medium text-sm">Payment Status *</label>
          <select
            className={`w-full mt-1 p-2 border rounded ${errors.paymentStatus ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'Paid' | 'Unpaid' })}
          >
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          {errors.paymentStatus && <p className="text-red-600 text-sm mt-1">{errors.paymentStatus}</p>}
        </div>

        {/* ✅ Invoice Amount */}
        <div>
          <label className="block font-medium text-sm">Invoice Amount (₹) *</label>
          <input
            type="number"
            name="invoiceAmount"
            value={formData.invoiceAmount}
            onChange={(e) => setFormData({ ...formData, invoiceAmount: e.target.value })}
            className={`w-full mt-1 p-2 border rounded ${errors.invoiceAmount ? 'border-red-500' : 'border-gray-300'}`}
            step="0.01"
            min="0"
          />
          {errors.invoiceAmount && <p className="text-red-600 text-sm mt-1">{errors.invoiceAmount}</p>}
        </div>

        {/* Attachment */}
        <div>
          <label className="block font-medium text-sm">Attachment (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            className="w-full mt-1 p-2 border rounded"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit */}
        <div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
  )
}