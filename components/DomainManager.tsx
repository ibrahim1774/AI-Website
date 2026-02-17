import React, { useState } from 'react';
import { SiteInstance } from '../types.js';
import { Search, CheckCircle, XCircle, Globe, Loader2, ExternalLink } from 'lucide-react';

interface DomainManagerProps {
  site: SiteInstance;
  onDomainConnected: (domain: string, orderId: string) => void;
}

interface SearchResult {
  available: boolean;
  domain: string;
  price?: number;
  renewalPrice?: number;
  gbpPrice?: number;
  gbpRenewalPrice?: number;
}

const TLD_OPTIONS = ['.com', '.co.uk', '.net', '.org'];

function sanitizeDomainInput(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function usdToGbp(usd: number): number {
  return Math.round((usd * 0.80 + 5) * 100) / 100;
}

const DomainManager: React.FC<DomainManagerProps> = ({ site, onDomainConnected }) => {
  const [domainInput, setDomainInput] = useState('');
  const [selectedTld, setSelectedTld] = useState('.com');
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  // If domain is already connected, show connected state
  if (site.customDomain) {
    return (
      <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6">
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Custom Domain</div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Globe size={20} className="text-green-400" />
          </div>
          <div className="flex-1">
            <a
              href={`https://${site.customDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold transition-colors flex items-center gap-2"
            >
              {site.customDomain} <ExternalLink size={14} />
            </a>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30 bg-green-500/10 text-green-400">
            Connected
          </span>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    const sanitized = sanitizeDomainInput(domainInput);
    if (!sanitized) return;

    const fullDomain = `${sanitized}${selectedTld}`;
    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch('api/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: fullDomain }),
      });

      if (!response.ok) throw new Error('Failed to check domain');

      const data = await response.json();

      setSearchResult({
        available: data.available,
        domain: fullDomain,
        price: data.price,
        renewalPrice: data.renewalPrice,
        gbpPrice: data.price ? usdToGbp(data.price) : undefined,
        gbpRenewalPrice: data.renewalPrice ? usdToGbp(data.renewalPrice) : undefined,
      });
    } catch (err) {
      console.error('[Domain] Search failed:', err);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBuyDomain = async () => {
    if (!searchResult || !searchResult.available || !searchResult.price) return;

    setIsPurchasing(true);

    try {
      // Extract project name from deployed URL
      let projectName = '';
      if (site.deployedUrl) {
        const url = new URL(site.deployedUrl);
        projectName = url.hostname.replace('.vercel.app', '');
      }

      const response = await fetch('api/create-domain-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: searchResult.domain,
          vercelPrice: searchResult.price,
          siteId: site.id,
          projectName,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout');

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('[Domain] Checkout failed:', err);
      alert(err.message || 'Failed to start domain purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Custom Domain</div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={domainInput}
          onChange={(e) => setDomainInput(sanitizeDomainInput(e.target.value))}
          onKeyDown={handleKeyDown}
          placeholder="yourbusiness"
          className="flex-1 bg-[#05070A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm font-medium outline-none focus:border-blue-500 transition-colors"
        />
        <select
          value={selectedTld}
          onChange={(e) => setSelectedTld(e.target.value)}
          className="bg-[#05070A] border border-white/10 rounded-xl px-3 py-3 text-white text-sm font-medium outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
        >
          {TLD_OPTIONS.map(tld => (
            <option key={tld} value={tld}>{tld}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          disabled={!domainInput || isSearching}
          className="bg-white/10 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </div>

      {/* Results */}
      {searchResult && (
        <div className={`rounded-xl p-5 border ${
          searchResult.available
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-red-500/30 bg-red-500/5'
        }`}>
          {searchResult.available ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-green-400 font-bold">{searchResult.domain} is available!</span>
              </div>
              {searchResult.gbpPrice && (
                <div className="space-y-1">
                  <div className="text-white text-2xl font-bold">
                    £{searchResult.gbpPrice.toFixed(2)}<span className="text-gray-400 text-sm font-normal">/year</span>
                  </div>
                  {searchResult.gbpRenewalPrice && (
                    <div className="text-gray-400 text-xs">
                      Renews at £{searchResult.gbpRenewalPrice.toFixed(2)}/year
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleBuyDomain}
                disabled={isPurchasing}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPurchasing && <Loader2 size={16} className="animate-spin" />}
                Buy Domain {searchResult.gbpPrice ? `— £${searchResult.gbpPrice.toFixed(2)}` : ''}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <XCircle size={20} className="text-red-400" />
              <span className="text-red-400 font-bold">{searchResult.domain} is not available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainManager;
