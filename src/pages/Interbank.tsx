import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Building2, Search, AlertCircle, Clock, ChevronDown, Check, QrCode } from 'lucide-react';

export default function Interbank() {
  const navigate = useNavigate();
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const banks = [
    { id: '1', name: 'Access Bank' },
    { id: '2', name: 'Access Bank (Diamond)' },
    { id: '3', name: 'ALAT by WEMA' },
    { id: '4', name: 'ASO Savings and Loans' },
    { id: '5', name: 'Bowen Microfinance Bank' },
    { id: '6', name: 'Cemcs Microfinance Bank' },
    { id: '7', name: 'Citibank Nigeria' },
    { id: '8', name: 'Coronation Merchant Bank' },
    { id: '9', name: 'Ecobank Nigeria' },
    { id: '10', name: 'Ekondo Microfinance Bank' },
    { id: '11', name: 'Fidelity Bank' },
    { id: '12', name: 'First Bank of Nigeria' },
    { id: '13', name: 'First City Monument Bank (FCMB)' },
    { id: '14', name: 'FSDH Merchant Bank' },
    { id: '15', name: 'Globus Bank' },
    { id: '16', name: 'Guaranty Trust Bank (GTB)' },
    { id: '17', name: 'Hackman Microfinance Bank' },
    { id: '18', name: 'Hasal Microfinance Bank' },
    { id: '19', name: 'Heritage Bank' },
    { id: '20', name: 'Ibile Microfinance Bank' },
    { id: '21', name: 'Infinity Microfinance Bank' },
    { id: '22', name: 'Jaiz Bank' },
    { id: '23', name: 'Keystone Bank' },
    { id: '24', name: 'Kuda Bank' },
    { id: '25', name: 'Lagos Building Investment Company' },
    { id: '26', name: 'Moniepoint Microfinance Bank' },
    { id: '27', name: 'Mutual Trust Microfinance Bank' },
    { id: '28', name: 'Ndiorah Microfinance Bank' },
    { id: '29', name: 'Opay' },
    { id: '30', name: 'Palmpay' },
    { id: '31', name: 'Parallex Bank' },
    { id: '32', name: 'Parkway - ReadyCash' },
    { id: '33', name: 'Paycom' },
    { id: '34', name: 'Petra Microfinance Bank' },
    { id: '35', name: 'Polaris Bank' },
    { id: '36', name: 'PremiumTrust Bank' },
    { id: '37', name: 'Providus Bank' },
    { id: '38', name: 'Rand Merchant Bank' },
    { id: '39', name: 'Rubies MFB' },
    { id: '40', name: 'Sparkle Microfinance Bank' },
    { id: '41', name: 'Stanbic IBTC Bank' },
    { id: '42', name: 'Standard Chartered Bank' },
    { id: '43', name: 'Sterling Bank' },
    { id: '44', name: 'SunTrust Bank' },
    { id: '45', name: 'TAJBank' },
    { id: '46', name: 'TCF MFB' },
    { id: '47', name: 'Titan Trust Bank' },
    { id: '48', name: 'Union Bank of Nigeria' },
    { id: '49', name: 'United Bank for Africa (UBA)' },
    { id: '50', name: 'Unity Bank' },
    { id: '51', name: 'VFD Microfinance Bank' },
    { id: '52', name: 'Wema Bank' },
    { id: '53', name: 'Zenith Bank' }
  ];

  const filteredBanks = banks.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank || accountNumber.length !== 10) {
      setError("Please select a bank and enter a valid 10-digit account number.");
      return;
    }

    setIsVerifying(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsVerifying(false);
      setError("Account not found in NIBSS database. Please check the details.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-text" />
        </button>
        <h1 className="text-xl font-bold text-neutral-text">Other Banks</h1>
      </header>

      <main className="flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mb-8"
        >
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900">Coming Soon</p>
            <p className="text-xs text-blue-700 mt-1">Interbank transfers are currently in beta. You can verify accounts, but transfers will be enabled shortly.</p>
          </div>
        </motion.div>

        {error && (
          <div className="bg-status-error/10 text-status-error p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-text">Select Bank</label>
            <div className="relative" ref={dropdownRef}>
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted z-10" />
              
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-sm cursor-pointer flex items-center justify-between border border-transparent hover:border-gray-200 transition-colors"
              >
                <span className={`text-sm ${bank ? 'text-neutral-text' : 'text-neutral-muted'}`}>
                  {bank ? banks.find(b => b.id === bank)?.name : 'Choose a bank...'}
                </span>
                <ChevronDown className={`w-5 h-5 text-neutral-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-72 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
                      <input
                        type="text"
                        placeholder="Search bank..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-2">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setBank(b.id);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className={`w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${bank === b.id ? 'bg-primary/5 text-primary font-medium' : 'text-neutral-text'}`}
                        >
                          {b.name}
                          {bank === b.id && <Check className="w-4 h-4" />}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-neutral-muted">No banks found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-text">Account Number</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
              <input
                type="text"
                maxLength={10}
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-12 py-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-mono text-lg tracking-wider"
                placeholder="0000000000"
              />
              <button
                type="button"
                onClick={() => setError("QR Code scanning is coming soon.")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !bank || accountNumber.length !== 10}
            className="w-full bg-neutral-text hover:bg-black text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-8 flex justify-center items-center shadow-lg shadow-neutral-text/20"
          >
            {isVerifying ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Account'}
          </button>
        </form>
      </main>
    </div>
  );
}
