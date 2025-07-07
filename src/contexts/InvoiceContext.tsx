import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoiceAPI } from '../services/api';
import { useAuth } from './AuthContext';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  customerPhone?: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  attachmentPath?: string;
  attachmentOriginalName?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
  createdAt: string;
  updatedAt: string;
  reminderSent?: string;
}

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'taxAmount' | 'totalAmount'> & { attachment?: File }) => Promise<boolean>;
  updateInvoice: (id: string, updates: Partial<Invoice> & { attachment?: File }) => Promise<boolean>;
  getInvoicesByCustomer: (params?: any) => Promise<void>;
  getAllInvoices: (params?: any) => Promise<void>;
  searchInvoice: (invoiceId: string) => Promise<Invoice | null>;
  refreshInvoices: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'taxAmount' | 'totalAmount'> & { attachment?: File }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add all invoice data to FormData
      Object.keys(invoiceData).forEach(key => {
        if (key === 'attachment') return;
        if (key === 'lineItems') {
          formData.append(key, JSON.stringify(invoiceData[key]));
        } else {
          formData.append(key, invoiceData[key as keyof typeof invoiceData] as string);
        }
      });
      
      // Add file if present
      if (invoiceData.attachment) {
        formData.append('attachment', invoiceData.attachment);
      }
      
      const response = await invoiceAPI.createInvoice(formData);
      const newInvoice = response.data.invoice;
      
      setInvoices(prev => [newInvoice, ...prev]);
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create invoice');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice> & { attachment?: File }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add all update data to FormData
      Object.keys(updates).forEach(key => {
        if (key === 'attachment') return;
        if (key === 'lineItems') {
          formData.append(key, JSON.stringify(updates[key]));
        } else {
          formData.append(key, updates[key as keyof typeof updates] as string);
        }
      });
      
      // Add file if present
      if (updates.attachment) {
        formData.append('attachment', updates.attachment);
      }
      
      const response = await invoiceAPI.updateInvoice(id, formData);
      const updatedInvoice = response.data.invoice;
      
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === id ? updatedInvoice : invoice
        )
      );
      return true;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update invoice');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getInvoicesByCustomer = async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log(params);
      const response = await invoiceAPI.getCustomerInvoices(params);
      setInvoices(response.data.invoices);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };


  const searchInvoice = async (invoiceId: string): Promise<Invoice | null> => {
    try {
      setError(null);
      console.log('Searching for invoice:', invoiceId);
      const response = await invoiceAPI.searchInvoice(invoiceId);
      
      return response.data.invoice;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invoice not found');
      return null;
    }
  };
  
  return (
    <InvoiceContext.Provider value={{
      invoices,
      loading,
      error,
      addInvoice,
      updateInvoice,
      getInvoicesByCustomer,
      searchInvoice
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
}