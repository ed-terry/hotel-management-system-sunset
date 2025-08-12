import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  DocumentTextIcon,
  PrinterIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  createdAt: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      guestName: 'John Smith',
      guestEmail: 'john.smith@email.com',
      guestPhone: '+1 (555) 123-4567',
      guestAddress: '123 Main St, New York, NY 10001',
      roomNumber: '205',
      checkIn: '2025-01-25',
      checkOut: '2025-01-28',
      nights: 3,
      items: [
        { id: '1', description: 'Room Charge - Deluxe Room', quantity: 3, rate: 185, amount: 555 },
        { id: '2', description: 'Breakfast Service', quantity: 3, rate: 25, amount: 75 },
        { id: '3', description: 'Spa Service', quantity: 1, rate: 120, amount: 120 },
      ],
      subtotal: 750,
      taxRate: 10,
      taxAmount: 75,
      total: 825,
      status: 'Paid',
      createdAt: '2025-01-28',
      dueDate: '2025-02-11',
      paidDate: '2025-01-29',
      paymentMethod: 'Credit Card',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah.j@email.com',
      guestPhone: '+1 (555) 987-6543',
      guestAddress: '456 Oak Ave, Los Angeles, CA 90210',
      roomNumber: '312',
      checkIn: '2025-01-26',
      checkOut: '2025-01-29',
      nights: 3,
      items: [
        { id: '1', description: 'Room Charge - Suite', quantity: 3, rate: 275, amount: 825 },
        { id: '2', description: 'Room Service', quantity: 2, rate: 45, amount: 90 },
      ],
      subtotal: 915,
      taxRate: 10,
      taxAmount: 91.5,
      total: 1006.5,
      status: 'Sent',
      createdAt: '2025-01-29',
      dueDate: '2025-02-12',
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [invoiceForm, setInvoiceForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestAddress: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    taxRate: 10,
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  // Hotel settings (this would come from your Settings page in real implementation)
  const hotelSettings = {
    name: localStorage.getItem('hotelName') || 'Grand Hotel & Resort',
    logo: localStorage.getItem('hotelLogo') || '',
    address: '123 Hotel Street, City, State 12345',
    phone: '+1 (555) 123-HOTEL',
    email: 'info@grandhotel.com',
    website: 'www.grandhotel.com',
    tinNumber: 'TIN: 123-456-789',
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.roomNumber.includes(searchTerm);

    const matchesStatus = 
      filterStatus === 'all' || 
      invoice.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    
    // Recalculate amount
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setInvoiceItems(updatedItems);
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      const updatedItems = invoiceItems.filter((_, i) => i !== index);
      setInvoiceItems(updatedItems);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * invoiceForm.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { subtotal, taxAmount, total } = calculateTotals();
    const nights = calculateNights(invoiceForm.checkIn, invoiceForm.checkOut);
    
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      guestName: invoiceForm.guestName,
      guestEmail: invoiceForm.guestEmail,
      guestPhone: invoiceForm.guestPhone,
      guestAddress: invoiceForm.guestAddress,
      roomNumber: invoiceForm.roomNumber,
      checkIn: invoiceForm.checkIn,
      checkOut: invoiceForm.checkOut,
      nights,
      items: invoiceItems.filter(item => item.description.trim()),
      subtotal,
      taxRate: invoiceForm.taxRate,
      taxAmount,
      total,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    };

    setInvoices(prev => [...prev, newInvoice]);
    setShowInvoiceForm(false);
    resetForm();
    toast.success('Invoice created successfully!');
  };

  const resetForm = () => {
    setInvoiceForm({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      guestAddress: '',
      roomNumber: '',
      checkIn: '',
      checkOut: '',
      taxRate: 10,
    });
    setInvoiceItems([
      { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'Sent' as const } : inv
    );
    setInvoices(updatedInvoices);
    toast.success(`Invoice ${invoice.invoiceNumber} sent to ${invoice.guestEmail}`);
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { 
            ...inv, 
            status: 'Paid' as const, 
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Credit Card'
          } 
        : inv
    );
    setInvoices(updatedInvoices);
    toast.success(`Invoice ${invoice.invoiceNumber} marked as paid`);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-400 bg-green-900/20';
      case 'Sent': return 'text-blue-400 bg-blue-900/20';
      case 'Draft': return 'text-gray-400 bg-gray-900/20';
      case 'Overdue': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-500 bg-gray-800/20';
    }
  };

  const InvoicePreview = ({ invoice }: { invoice: Invoice }) => (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {hotelSettings.logo && (
            <img src={hotelSettings.logo} alt="Hotel Logo" className="h-16 mb-4" />
          )}
          <h1 className="text-3xl font-bold text-gray-800">{hotelSettings.name}</h1>
          <div className="text-gray-600 mt-2">
            <p>{hotelSettings.address}</p>
            <p>{hotelSettings.phone} • {hotelSettings.email}</p>
            <p>{hotelSettings.website}</p>
            <p className="mt-2 font-medium">{hotelSettings.tinNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
          <div className="text-gray-600">
            <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> {invoice.createdAt}</p>
            <p><strong>Due Date:</strong> {invoice.dueDate}</p>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
          <div className="text-gray-600">
            <p className="font-medium">{invoice.guestName}</p>
            <p>{invoice.guestAddress}</p>
            <p>{invoice.guestPhone}</p>
            <p>{invoice.guestEmail}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Stay Details:</h3>
          <div className="text-gray-600">
            <p><strong>Room:</strong> {invoice.roomNumber}</p>
            <p><strong>Check-in:</strong> {invoice.checkIn}</p>
            <p><strong>Check-out:</strong> {invoice.checkOut}</p>
            <p><strong>Nights:</strong> {invoice.nights}</p>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-3 text-center">Qty</th>
              <th className="border border-gray-300 px-4 py-3 text-right">Rate</th>
              <th className="border border-gray-300 px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-3">{item.description}</td>
                <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">${item.rate.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span>Tax ({invoice.taxRate}%):</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 text-lg font-bold border-b-2 border-gray-800">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="border-t border-gray-300 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
        <div className="text-gray-600 text-sm">
          <p>Payment is due within 14 days of invoice date.</p>
          <p>Please include invoice number {invoice.invoiceNumber} with your payment.</p>
          {invoice.status === 'Paid' && invoice.paidDate && (
            <p className="text-green-600 font-medium mt-2">
              ✓ Paid on {invoice.paidDate} via {invoice.paymentMethod}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-300">
        <p>Thank you for choosing {hotelSettings.name}!</p>
        <p>We look forward to serving you again.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/50 to-primary/5">
      {/* Modern Header */}
      <div className="relative bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/10 backdrop-blur-sm border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-30"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/30">
                <DocumentTextIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Invoice & Receipt Management
                </h1>
                <p className="text-base-content/70 mt-1">Create and manage hotel invoices and receipts</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowInvoiceForm(true);
              }}
              className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

      {/* Search and Filter */}
      <div className="bg-primary-light rounded-lg shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <DocumentTextIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number, guest name, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-primary-light rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Paid Invoices</p>
              <p className="text-2xl font-bold text-white">
                {invoices.filter(inv => inv.status === 'Paid').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-600/20 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Payment</p>
              <p className="text-2xl font-bold text-white">
                {invoices.filter(inv => inv.status === 'Sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary-light rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-primary-light rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-600">
          <h2 className="text-lg font-semibold text-white">
            Invoices ({filteredInvoices.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-600">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{invoice.invoiceNumber}</h3>
                    <p className="text-gray-400 text-sm">{invoice.guestName}</p>
                    <p className="text-gray-500 text-xs">Room {invoice.roomNumber} • {invoice.checkIn} to {invoice.checkOut}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-bold">${invoice.total.toFixed(2)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePrintInvoice(invoice)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Print/Preview"
                    >
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                    
                    {invoice.status === 'Draft' && (
                      <button
                        onClick={() => handleSendInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Send Invoice"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    {invoice.status === 'Sent' && (
                      <button
                        onClick={() => handleMarkAsPaid(invoice)}
                        className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                        title="Mark as Paid"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredInvoices.length === 0 && (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-light rounded-lg p-6 w-full max-w-4xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New Invoice</h2>
              <button
                onClick={() => setShowInvoiceForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitInvoice} className="space-y-6">
              {/* Guest Information */}
              <div className="border-b border-gray-600 pb-4">
                <h3 className="text-lg font-medium text-white mb-4">Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.guestName}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, guestName: e.target.value }))}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={invoiceForm.guestEmail}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, guestEmail: e.target.value }))}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={invoiceForm.guestPhone}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, guestPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.roomNumber}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={invoiceForm.guestAddress}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, guestAddress: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Stay Information */}
              <div className="border-b border-gray-600 pb-4">
                <h3 className="text-lg font-medium text-white mb-4">Stay Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={invoiceForm.checkIn}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={invoiceForm.checkOut}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoiceForm.taxRate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Invoice Items</h3>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="px-3 py-1 bg-secondary hover:bg-secondary-dark text-white rounded text-sm transition-colors"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                          placeholder="Enter description..."
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Rate ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-secondary focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Amount
                        </label>
                        <input
                          type="text"
                          value={`$${item.amount.toFixed(2)}`}
                          readOnly
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                        />
                      </div>

                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={invoiceItems.length === 1}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Preview */}
                <div className="mt-6 p-4 bg-primary rounded-lg">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Subtotal:</span>
                        <span className="text-white">${calculateTotals().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tax ({invoiceForm.taxRate}%):</span>
                        <span className="text-white">${calculateTotals().taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-white">${calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-md transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-5xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Invoice Preview</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const printContent = document.getElementById('invoice-content');
                    if (printContent) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Invoice ${selectedInvoice.invoiceNumber}</title>
                              <style>
                                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                                table { border-collapse: collapse; width: 100%; }
                                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                                th { background-color: #f5f5f5; }
                                .text-right { text-align: right; }
                                .text-center { text-align: center; }
                                @media print { body { margin: 0; } }
                              </style>
                            </head>
                            <body>${printContent.innerHTML}</body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowInvoicePreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <InvoicePreview invoice={selectedInvoice} />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Invoices;
