import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Car, 
  HelpCircle, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  AlertCircle,
  Camera
} from 'lucide-react';
import { VEHICLE_MAKES } from '../../data/catalogData';
import { quoteFormSchema, QuoteFormValues } from '../../utils/validationSchemas';
import { validateVIN } from '../../utils/formatters';
import { QuoteFormSkeleton } from '../../components/Skeletons';

interface QuotePageProps {
  onBackToStorefront?: () => void;
}

export const RequestQuoteContent: React.FC<QuotePageProps> = ({ onBackToStorefront }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      make: 'Toyota',
      model: '',
      year: '',
      engine: '',
      conditionPref: 'any',
      urgency: 'standard',
      fullName: '',
      whatsappNumber: '',
      email: '',
      cityProvince: 'Johannesburg, GP',
      vin: '',
      partDescription: '',
    },
  });

  const vinValue = watch('vin');
  const vinValidation = validateVIN(vinValue || '');

  const [uploadedPhotos, setUploadedPhotos] = useState<{ id: string; name: string; url: string; size: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [showVinGuideModal, setShowVinGuideModal] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems = Array.from(files).map((f, i) => ({
      id: `img-${Date.now()}-${i}`,
      name: f.name,
      url: URL.createObjectURL(f),
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setUploadedPhotos((prev) => [...prev, ...newItems]);
  };

  const handleRemovePhoto = (id: string) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFormSubmit = async (data: QuoteFormValues) => {
    // TODO: POST to /api/quotes with form data + uploaded photos
    // The backend will broadcast to matching suppliers
    console.log('Quote request submitted:', data);
    const reqId = `WQ-${Date.now().toString(36).toUpperCase()}`;
    setSubmittedRequestId(reqId);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* HERO BANNER */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>South Africa's #1 Autopart Sourcing Service</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Can't find your specific part? <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Let 500+ Verified SA Suppliers Quote You.
            </span>
          </h1>

          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            Submit your VIN, vehicle specs, or part photos. Scrap yards and OEM importers across SA compete to give you the best price.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* 3-STEP VISUAL STEPPER */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-12">
          <h2 className="text-center text-xs font-black uppercase tracking-widest text-amber-400 mb-6">
            How The Quote Process Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">1</span>
              <h3 className="font-bold text-white text-sm">You Request</h3>
              <p className="text-xs text-slate-400">Fill in VIN & vehicle specs or snap a photo of the broken part.</p>
            </div>
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center">2</span>
              <h3 className="font-bold text-white text-sm">SA Suppliers Quote</h3>
              <p className="text-xs text-slate-400">500+ verified SA scrap yards & dealers check inventory.</p>
            </div>
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">3</span>
              <h3 className="font-bold text-white text-sm">You Pick & Save</h3>
              <p className="text-xs text-slate-400">Choose the best price with door-to-door express courier delivery.</p>
            </div>
          </div>
        </div>

        {/* SUBMITTED CONFIRMATION STATE */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 sm:p-12 shadow-2xl text-center space-y-6 max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                REQUEST ID: {submittedRequestId}
              </span>
              <h2 className="text-2xl font-black text-white">Quote Request Broadcasted!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Dispatched to suppliers in your region. Watch your WhatsApp/Email for quotes.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase"
              >
                Submit Another Request
              </button>
            </div>
          </motion.div>
        ) : (
          
          /* FORM WITH REACT HOOK FORM & ZOD VALIDATION */
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            
            {/* Section 1: Vehicle & VIN */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-400" />
                  <span>1. Vehicle Information</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowVinGuideModal(true)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Where is my VIN?</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Make *</label>
                  <select
                    {...register('make')}
                    className="w-full h-11 bg-slate-950 text-white px-3 rounded-xl border border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  >
                    {VEHICLE_MAKES.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  {errors.make && <p className="text-red-400 text-[11px]">{errors.make.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Model *</label>
                  <input
                    {...register('model')}
                    type="text"
                    placeholder="e.g. Hilux, Polo, Ranger"
                    className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                      errors.model ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.model && <p className="text-red-400 text-[11px]">{errors.model.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Year *</label>
                  <input
                    {...register('year')}
                    type="text"
                    placeholder="e.g. 2018"
                    className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                      errors.year ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.year && <p className="text-red-400 text-[11px]">{errors.year.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Engine / Trim</label>
                  <input
                    {...register('engine')}
                    type="text"
                    placeholder="e.g. 2.8 GD-6"
                    className="w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  />
                </div>
              </div>

              {/* VIN Input */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>17-Character VIN (Vehicle Identification Number)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                      Guarantees 100% Fitment
                    </span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {(vinValue || '').length}/17 Chars
                  </span>
                </div>

                <input
                  {...register('vin')}
                  type="text"
                  maxLength={17}
                  onChange={(e) => setValue('vin', e.target.value.toUpperCase())}
                  placeholder="e.g. AHTFR22G901234567 (17 Chars)"
                  className={`w-full h-12 bg-slate-950 text-white font-mono text-sm tracking-widest px-4 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none uppercase ${
                    errors.vin ? 'border-red-500 bg-red-950/20' : vinValue && vinValidation.isValid ? 'border-emerald-500' : 'border-slate-700'
                  }`}
                  aria-invalid={errors.vin ? 'true' : 'false'}
                />

                {errors.vin && (
                  <p className="text-red-400 text-xs flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.vin.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: Part Description */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>2. Part Details & Condition</span>
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Describe the part *</label>
                  <textarea
                    {...register('partDescription')}
                    rows={3}
                    placeholder="e.g. Front brake pad set & vented brake discs for 2018 Hilux..."
                    className={`w-full bg-slate-950 text-white text-xs p-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                      errors.partDescription ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.partDescription && <p className="text-red-400 text-[11px]">{errors.partDescription.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Photo Upload */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span>3. Upload Photos (Broken Part / License Disk)</span>
                </h3>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
                  isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-950/60 hover:border-amber-500/50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Upload photo of broken part or license disk"
                />
                <div className="space-y-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-white">
                    Drag & drop part photos here or <span className="text-amber-400 underline">Browse</span>
                  </p>
                </div>
              </div>

              {/* Uploaded photos preview */}
              {uploadedPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700">
                      <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Contact Information */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span>4. Where should we send your quotes?</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Full Name *</label>
                  <input {...register('fullName')} type="text" className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${errors.fullName ? 'border-red-500' : 'border-slate-700'}`} />
                  {errors.fullName && <p className="text-red-400 text-[11px]">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">WhatsApp / Mobile *</label>
                  <input {...register('whatsappNumber')} type="tel" className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${errors.whatsappNumber ? 'border-red-500' : 'border-slate-700'}`} />
                  {errors.whatsappNumber && <p className="text-red-400 text-[11px]">{errors.whatsappNumber.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Email Address *</label>
                  <input {...register('email')} type="email" className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${errors.email ? 'border-red-500' : 'border-slate-700'}`} />
                  {errors.email && <p className="text-red-400 text-[11px]">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">City / Province *</label>
                  <select {...register('cityProvince')} className="w-full h-11 bg-slate-950 text-white px-3 rounded-xl border border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500">
                    <option value="Johannesburg, GP">Johannesburg, GP</option>
                    <option value="Pretoria, GP">Pretoria, GP</option>
                    <option value="Cape Town, WC">Cape Town, WC</option>
                    <option value="Durban, KZN">Durban, KZN</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                <Send className="w-5 h-5 fill-slate-950" />
                <span>Submit Quote Request (100% Free)</span>
              </button>
            </div>

          </form>
        )}

      </div>

      {/* VIN GUIDANCE MODAL */}
      <AnimatePresence>
        {showVinGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVinGuideModal(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 relative z-10 shadow-2xl">
              <button onClick={() => setShowVinGuideModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1" aria-label="Close VIN guide"><X className="w-5 h-5" /></button>
              <h3 className="font-bold text-white text-base">Where to Find Your 17-Char VIN</h3>
              <p className="text-xs text-slate-300">1. SA Vehicle License Disk (windscreen)<br/>2. Driver dashboard glass corner<br/>3. NaTIS Logbook</p>
              <button onClick={() => setShowVinGuideModal(false)} className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase">Got It</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RequestQuotePage: React.FC<QuotePageProps> = (props) => {
  return (
    <Suspense fallback={<QuoteFormSkeleton />}>
      <RequestQuoteContent {...props} />
    </Suspense>
  );
};
