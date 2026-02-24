
import React, { useRef, useState } from 'react';
import { GeneratedSiteData } from '../types.js';
import IconRenderer from './IconRenderer.js';
import { compressImage } from '../services/imageService.js';
import { CheckCircle, Camera, ArrowRight, Phone, Loader2 } from 'lucide-react';

interface SiteRendererProps {
  data: GeneratedSiteData;
  isEditMode: boolean;
  onUpdate?: (updatedData: GeneratedSiteData) => void;
}

const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

const EditableText: React.FC<{
  text: string;
  className?: string;
  isEditMode: boolean;
  onBlur: (val: string) => void;
  as?: React.ElementType;
  style?: React.CSSProperties;
}> = ({ text, className, isEditMode, onBlur, as: Tag = 'div', style }) => {
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    onBlur(e.currentTarget.innerText);
  };

  return (
    <Tag
      contentEditable={isEditMode}
      suppressContentEditableWarning
      className={`${className} ${isEditMode ? 'hover:ring-2 hover:ring-blue-400/30 transition-all outline-none focus:ring-2 focus:ring-blue-500/50 rounded-sm' : ''}`}
      onBlur={handleBlur}
      style={style}
    >
      {text}
    </Tag>
  );
};

const EditableImage: React.FC<{
  src: string;
  alt: string;
  className: string;
  isEditMode: boolean;
  onUpload: (base64: string) => void;
}> = ({ src, alt, className, isEditMode, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      onUpload(compressed);
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => onUpload(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative group overflow-hidden ${className}`} onClick={() => isEditMode && !isUploading && fileInputRef.current?.click()}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {isUploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
          <div className="text-white font-bold flex items-center gap-2 text-sm">
            <Loader2 className="animate-spin" size={20} /> Uploading...
          </div>
        </div>
      )}
      {isEditMode && !isUploading && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 z-20">
          <div className="bg-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 transform group-hover:scale-105 transition-transform">
            <Camera className="text-blue-600 w-5 h-5" />
            <span className="text-blue-900 font-bold text-xs uppercase tracking-tight">Replace Image</span>
          </div>
        </div>
      )}
      <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
    </div>
  );
};

const SiteRenderer: React.FC<SiteRendererProps> = ({ data, isEditMode, onUpdate }) => {
  const primaryColor = '#2563eb';

  const updateField = (path: string, val: any) => {
    if (!onUpdate) return;
    const newData = JSON.parse(JSON.stringify(data));
    const keys = path.split('.');
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = val;
    onUpdate(newData);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-sans antialiased">

      {/* 1. Header — Minimal */}
      <header className="sticky top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center">
        <EditableText
          text={data.contact.companyName}
          isEditMode={isEditMode}
          onBlur={(val) => updateField('contact.companyName', val)}
          className="font-black text-xl md:text-2xl tracking-tighter text-slate-900"
        />
        <a
          href={`tel:${data.contact.phone}`}
          className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-700 hover:text-blue-600 transition-colors"
        >
          <Phone size={16} style={{ color: primaryColor }} />
          <span>{formatPhoneNumber(data.contact.phone)}</span>
        </a>
      </header>

      {/* 2. Hero Section — Full-width background image */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <EditableImage
            src={data.hero.heroImage}
            alt="Hero"
            className="w-full h-full"
            isEditMode={isEditMode}
            onUpload={(base64) => updateField('hero.heroImage', base64)}
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full py-16">
          <div className="max-w-2xl">
            <EditableText
              text={data.hero.headline}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('hero.headline', val)}
              className="text-white text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6"
              as="h1"
            />
            <EditableText
              text={data.hero.subheadline}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('hero.subheadline', val)}
              className="text-slate-200 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl"
            />
            <a
              href={`tel:${data.contact.phone}`}
              className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98] uppercase tracking-tight text-base"
              style={{ backgroundColor: primaryColor }}
            >
              <EditableText
                text={data.hero.ctaText}
                isEditMode={isEditMode}
                onBlur={(val) => updateField('hero.ctaText', val)}
              />
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Trust/Credibility Section — White bg, two-column */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="lg:w-1/2">
            <EditableImage
              src={data.trust.image}
              alt="Trust"
              className="rounded-3xl shadow-2xl w-full aspect-[4/5] object-cover"
              isEditMode={isEditMode}
              onUpload={(base64) => updateField('trust.image', base64)}
            />
          </div>
          <div className="lg:w-1/2 space-y-8">
            <EditableText
              text={data.trust.headline}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('trust.headline', val)}
              className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight"
              as="h2"
            />
            <EditableText
              text={data.trust.paragraph}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('trust.paragraph', val)}
              className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed"
            />
            <div className="space-y-4">
              {data.trust.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5" style={{ backgroundColor: primaryColor }}>
                    <CheckCircle size={14} />
                  </div>
                  <EditableText
                    text={bullet}
                    isEditMode={isEditMode}
                    onBlur={(val) => {
                      const bullets = [...data.trust.bullets];
                      bullets[idx] = val;
                      updateField('trust.bullets', bullets);
                    }}
                    className="text-slate-800 font-semibold text-base md:text-lg"
                  />
                </div>
              ))}
            </div>
            <a
              href={`tel:${data.contact.phone}`}
              className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98] uppercase tracking-tight text-base"
              style={{ backgroundColor: primaryColor }}
            >
              <EditableText
                text={data.trust.ctaText}
                isEditMode={isEditMode}
                onBlur={(val) => updateField('trust.ctaText', val)}
              />
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 4. Services Overview — Light bg, icon grid */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <EditableText
              text={data.servicesOverview.headline}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('servicesOverview.headline', val)}
              className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4"
              as="h2"
            />
            <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.servicesOverview.cards.map((card, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                  <IconRenderer name={card.icon} className="w-7 h-7" />
                </div>
                <EditableText
                  text={card.title}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.servicesOverview.cards];
                    cards[idx].title = val;
                    updateField('servicesOverview.cards', cards);
                  }}
                  className="text-xl font-bold mb-3 tracking-tight text-slate-900"
                  as="h3"
                />
                <EditableText
                  text={card.description}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.servicesOverview.cards];
                    cards[idx].description = val;
                    updateField('servicesOverview.cards', cards);
                  }}
                  className="text-slate-500 text-base font-medium leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Value Proposition Banner — Dark bg, centered */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <EditableText
            text={data.valueBanner.headline}
            isEditMode={isEditMode}
            onBlur={(val) => updateField('valueBanner.headline', val)}
            className="text-white text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6"
            as="h2"
          />
          <EditableText
            text={data.valueBanner.subheadline}
            isEditMode={isEditMode}
            onBlur={(val) => updateField('valueBanner.subheadline', val)}
            className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed mb-10"
          />
          <a
            href={`tel:${data.contact.phone}`}
            className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98] uppercase tracking-tight text-base"
            style={{ backgroundColor: primaryColor }}
          >
            <EditableText
              text={data.valueBanner.ctaText}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('valueBanner.ctaText', val)}
            />
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* 6. Detailed Services — White bg, 3x2 grid */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <EditableText
              text={data.detailedServices.headline}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('detailedServices.headline', val)}
              className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4"
              as="h2"
            />
            <div className="w-20 h-1.5 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.detailedServices.cards.map((card, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                  <IconRenderer name={card.icon} className="w-6 h-6" />
                </div>
                <EditableText
                  text={card.title}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.detailedServices.cards];
                    cards[idx].title = val;
                    updateField('detailedServices.cards', cards);
                  }}
                  className="text-xl font-bold mb-3 tracking-tight text-slate-900"
                  as="h3"
                />
                <EditableText
                  text={card.description}
                  isEditMode={isEditMode}
                  onBlur={(val) => {
                    const cards = [...data.detailedServices.cards];
                    cards[idx].description = val;
                    updateField('detailedServices.cards', cards);
                  }}
                  className="text-slate-500 text-base font-medium leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Emergency/Urgency Section — Dark bg, centered */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-slate-950 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <EditableText
            text={data.emergency.headline}
            isEditMode={isEditMode}
            onBlur={(val) => updateField('emergency.headline', val)}
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6"
            as="h2"
          />
          <EditableText
            text={data.emergency.paragraph}
            isEditMode={isEditMode}
            onBlur={(val) => updateField('emergency.paragraph', val)}
            className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed mb-10"
          />
          <a
            href={`tel:${data.contact.phone}`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 text-white font-black rounded-xl shadow-2xl transition-all hover:bg-red-700 hover:scale-[1.03] active:scale-[0.98] uppercase tracking-tight text-lg"
          >
            <Phone size={20} />
            <EditableText
              text={data.emergency.ctaText}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('emergency.ctaText', val)}
            />
          </a>
        </div>
      </section>

      {/* 8. Why Choose Us — White bg, two-column */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="lg:w-1/2 space-y-8">
            <EditableText
              text={data.whyChooseUs.headline}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('whyChooseUs.headline', val)}
              className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight"
              as="h2"
            />
            <EditableText
              text={data.whyChooseUs.paragraph}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('whyChooseUs.paragraph', val)}
              className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed"
            />
            <div className="space-y-6">
              {data.whyChooseUs.differentiators.map((diff, idx) => (
                <div key={idx} className="border-l-4 pl-6" style={{ borderColor: primaryColor }}>
                  <EditableText
                    text={diff.title}
                    isEditMode={isEditMode}
                    onBlur={(val) => {
                      const diffs = [...data.whyChooseUs.differentiators];
                      diffs[idx].title = val;
                      updateField('whyChooseUs.differentiators', diffs);
                    }}
                    className="text-lg font-bold text-slate-900 mb-1"
                    as="h4"
                  />
                  <EditableText
                    text={diff.description}
                    isEditMode={isEditMode}
                    onBlur={(val) => {
                      const diffs = [...data.whyChooseUs.differentiators];
                      diffs[idx].description = val;
                      updateField('whyChooseUs.differentiators', diffs);
                    }}
                    className="text-slate-500 text-base font-medium leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2">
            <EditableImage
              src={data.whyChooseUs.image}
              alt="Why Choose Us"
              className="rounded-3xl shadow-2xl w-full aspect-[4/5] object-cover"
              isEditMode={isEditMode}
              onUpload={(base64) => updateField('whyChooseUs.image', base64)}
            />
          </div>
        </div>
      </section>

      {/* 9. Final CTA + Footer — Dark bg */}
      <section className="bg-slate-900 py-16 px-6 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <EditableText
            text={data.finalCta.headline}
            isEditMode={isEditMode}
            onBlur={(val) => updateField('finalCta.headline', val)}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-none"
            as="h2"
          />
          <EditableText
            text={data.finalCta.subheadline}
            isEditMode={isEditMode}
            onBlur={(val) => updateField('finalCta.subheadline', val)}
            className="text-slate-400 text-lg md:text-xl font-medium"
          />
          <a
            href={`tel:${data.contact.phone}`}
            className="inline-flex items-center gap-4 px-12 py-6 text-white font-black rounded-2xl shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98] uppercase tracking-tighter text-xl"
            style={{ backgroundColor: primaryColor }}
          >
            <EditableText
              text={data.finalCta.ctaText}
              isEditMode={isEditMode}
              onBlur={(val) => updateField('finalCta.ctaText', val)}
            />
            <ArrowRight size={24} />
          </a>
          <div className="pt-10 border-t border-slate-800 flex flex-col justify-between items-center gap-8 opacity-50 text-center">
            <div className="space-y-4">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Services and availability may vary. Contact us to confirm details.</p>
              <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>© 2026 {data.contact.companyName}</span>
                <span className="hidden md:inline">•</span>
                <span>Privacy Policy</span>
                <span className="hidden md:inline">•</span>
                <span>Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteRenderer;
