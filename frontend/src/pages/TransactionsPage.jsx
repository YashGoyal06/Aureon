import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/common/MetricCard';
import Reveal from '../components/motion/Reveal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiFetch } from '../lib/api';
import { useHeaderUser } from '../hooks/useHeaderUser';
import AddTransactionModal from '../components/transactions/AddTransactionModal';

const categoryTone = {
  income: 'success',
  dining: 'danger',
  coffee: 'warning',
  groceries: 'success',
  transportation: 'info',
  entertainment: 'info',
  shopping: 'warning',
  healthcare: 'info',
  education: 'info',
  housing: 'neutral',
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const fileInputRef = useRef(null);
  const user = useHeaderUser();

  const fetchTransactions = async () => {
    try {
      const data = await apiFetch('/finance/transactions/');
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const categoriesList = ['all', ...new Set(transactions.map((t) => (t.category_key || t.category || '').toLowerCase()).filter(Boolean))];
  const filteredTransactions = transactions.filter((t) => {
    const merchant = t.merchant || '';
    const note = t.note || '';
    const categoryKey = (t.category_key || t.category || '').toLowerCase();
    const matchesSearch = merchant.toLowerCase().includes(searchQuery.toLowerCase()) || note.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || categoryKey === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await apiFetch(`/finance/transactions/${id}/`, { method: 'DELETE' });
      fetchTransactions();
    } catch (err) {
      alert(`Failed to delete transaction: ${err.message}`);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiFetch('/importer/upload/', {
        method: 'POST',
        body: formData,
      });
      setUploadSuccess(data.message || 'Statement imported successfully.');
      setTimeout(() => {
        setUploadSuccess('');
        fetchTransactions();
      }, 3000);
    } catch (error) {
      alert(`Error importing statement: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const totalSpent = filteredTransactions.filter((t) => Number(t.amount) < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
  const totalIncome = filteredTransactions.filter((t) => Number(t.amount) > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netFlow = totalIncome - totalSpent;

  return (
    <AppShell user={user}>
      <button
        onClick={() => window.history.back()}
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/7 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        subtitle="Review spending, import statements, and let smart categorization keep your data clean."
        action={(
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="secondary">
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              {uploading ? 'Categorizing...' : 'Import statement'}
            </Button>
            <Button onClick={() => setShowAddTransaction(true)}>
              <Plus size={18} />
              Add transaction
            </Button>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".csv,.pdf,.xlsx" />
          </div>
        )}
      />

      {uploadSuccess && (
        <Reveal>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            <CheckCircle size={19} />
            {uploadSuccess}
          </div>
        </Reveal>
      )}

      <Reveal className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Total spending" value={totalSpent} prefix="₹" decimals={2} icon={ArrowUpRight} tone="danger" />
        <MetricCard label="Deposits / income" value={totalIncome} prefix="₹" decimals={2} icon={ArrowDownRight} tone="success" />
        <MetricCard label="Net flow" value={Math.abs(netFlow)} prefix={netFlow < 0 ? '-₹' : '+₹'} decimals={2} icon={Filter} tone={netFlow >= 0 ? 'success' : 'danger'} />
      </Reveal>

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search merchant or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white outline-none transition focus:border-emerald-300/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-500" size={18} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 min-w-56 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm capitalize text-white outline-none focus:border-emerald-300/40"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-300" size={36} />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="mx-auto mb-3 text-slate-500" size={36} />
            <p className="text-slate-300">No transactions found.</p>
            <p className="mt-1 text-sm text-slate-500">Create one or import a CSV statement.</p>
          </div>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: 'rgb(148 163 184)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' } }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Merchant</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((t) => {
                  const amount = Number(t.amount);
                  const key = (t.category_key || '').toLowerCase();
                  return (
                    <TableRow key={t.id} sx={{ '& td': { borderColor: 'rgba(255,255,255,0.06)', color: 'white' }, '&:hover': { background: 'rgba(255,255,255,0.035)' } }}>
                      <TableCell>{formatDate(t.date)}</TableCell>
                      <TableCell>
                        <p className="font-medium text-white">{t.merchant}</p>
                        {t.note && <p className="mt-1 text-xs text-slate-500">{t.note}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={categoryTone[key] || 'neutral'}>{t.category || 'Miscellaneous'}</Badge>
                          {key && key !== 'miscellaneous' && <span className="text-[11px] text-slate-500">Smart category</span>}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{t.payment_method || 'cash'}</TableCell>
                      <TableCell align="right">
                        <span className={amount > 0 ? 'font-semibold text-emerald-300' : 'font-semibold text-white'}>
                          {amount > 0 ? '+' : '-'}₹{Math.abs(amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <Button onClick={() => handleDelete(t.id)} variant="ghost" size="icon" className="text-red-200">
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {showAddTransaction && (
        <AddTransactionModal onClose={() => {
          setShowAddTransaction(false);
          fetchTransactions();
        }} />
      )}
    </AppShell>
  );
};

export default TransactionsPage;
