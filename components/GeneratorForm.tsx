
import React, { useState } from 'react';
import { GeneratorInputs } from '../types';
import { ArrowRight, Zap } from 'lucide-react';

interface GeneratorFormProps {
  onSubmit: (inputs: GeneratorInputs) => void;
  isLoading: boolean;
  onSignIn?: () => void;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isLoading, onSignIn }) => {
  const [inputs, setInputs] = useState<GeneratorInputs>({
    industry: '',
    companyName: '',
    location: '',
    phone: '',
    brandColor: '#2563eb',
    services: '',

    yearsInBusiness: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.industry || !inputs.companyName || !inputs.location || !inputs.phone) {
      alert("Please fill in all fields to generate your site.");
      return;
    }
    onSubmit(inputs);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 font-light" style={{ fontFamily: '"Avenir Light", Avenir, sans-serif' }}>
      {/* Top Header: Logo + Sign In */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <div className="text-sm font-bold tracking-[0.2em] text-white uppercase">
            PrimeHub <span className="text-blue-500">AI</span>
          </div>
        </div>
        {onSignIn && (
          <button
            onClick={onSignIn}
            className="text-white/70 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Headline Group - Reverted to 'under a minute' */}
      <div className="mb-4 md:mb-6 text-center space-y-3">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
          Generate your <br className="hidden md:block" />
          custom home service website <br className="hidden md:block" />
          <span className="text-blue-500 italic">under a minute.</span>
        </h1>

      </div>

      {/* Main Form Card - Tightened for fold visibility */}
      <div className="bg-[#0D1117]/80 backdrop-blur-sm border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden text-left">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 md:gap-y-6">
            {/* Service Industry */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                Service Industry
              </label>
              <input
                type="text"
                required
                placeholder="Plumbing, HVAC, etc..."
                value={inputs.industry}
                onChange={(e) => setInputs({ ...inputs, industry: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-700 text-base md:text-lg"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                Company Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter business name"
                value={inputs.companyName}
                onChange={(e) => setInputs({ ...inputs, companyName: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-700 text-base md:text-lg"
              />
            </div>

            {/* Service Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                Service Area
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dallas, TX"
                value={inputs.location}
                onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-700 text-base md:text-lg"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                Contact Phone
              </label>
              <input
                type="text"
                required
                placeholder="(555) 000-0000"
                value={inputs.phone}
                onChange={(e) => setInputs({ ...inputs, phone: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-700 text-base md:text-lg"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 md:gap-y-6">
            {/* Services Offered */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                Services Offered <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Drain cleaning, water heater repair..."
                value={inputs.services}
                onChange={(e) => setInputs({ ...inputs, services: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-700 text-base md:text-lg"
              />
            </div>

            {/* Years in Business */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                Years in Business <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 35"
                value={inputs.yearsInBusiness}
                onChange={(e) => setInputs({ ...inputs, yearsInBusiness: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 px-0 py-2 focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-700 text-base md:text-lg"
              />
            </div>
          </div>

          {/* Action Button - Large Rounded Pill */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group bg-white text-black font-bold px-8 py-3 md:px-10 md:py-4 rounded-full hover:bg-gray-100 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-black/40 uppercase tracking-widest text-xs md:text-sm"
            >
              {isLoading ? 'Generating Site...' : (
                <>
                  Generate My Website
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratorForm;
