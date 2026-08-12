import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  Hash
} from 'lucide-react';
import { VEHICLE_MAKES, VEHICLE_MODELS } from '../data/catalogData';

interface GarageSearchProps {
  onSearchSubmit: (params: { make: string; model: string; year: string; engine: string; keyword: string }) => void;
  onRequestQuoteClick: () => void;
  activeVehicleName?: string;
}

export const GarageSearch: React.FC<GarageSearchProps> = ({
  onSearchSubmit,
  onRequestQuoteClick,
}) => {
  const [searchMode, setSearchMode] = useState<'vehicle' | 'vin' | 'oem'>('vehicle');
  
  // State for vehicle selectors
  const [selectedMake, setSelectedMake] = useState<string>('toyota');
  const [selectedModel, setSelectedModel] = useState<string>('hilux');
  const [selectedYear, setSelectedYear] = useState<string>('2018');
  const [selectedEngine, setSelectedEngine] = useState<string>('2.8 GD-6 4x4 (150kW)');
  const [keyword, setKeyword] = useState<string>('');
  
  // State for VIN & OEM search modes
  const [vinNumber, setVinNumber] = useState<string>('');
  const [oemNumber, setOemNumber] = useState<string>('');

  // Available models based on selected make
  const availableModels = VEHICLE_MODELS.filter(m => m.makeId === selectedMake);
  const currentModelData = VEHICLE_MODELS.find(m => m.id === selectedModel) || availableModels[0];

  const handleMakeChange = (makeId: string) => {
    setSelectedMake(makeId);
    const newModels = VEHICLE_MODELS.filter(m => m.makeId === makeId);
    if (newModels.length > 0) {
      setSelectedModel(newModels[0].id);
      setSelectedEngine(newModels[0].engines[0] || '');
    } else {
      setSelectedModel('');
      setSelectedEngine('');
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const m = VEHICLE_MODELS.find(x => x.id === modelId);
    if (m && m.engines.length > 0) {
      setSelectedEngine(m.engines[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const makeObj = VEHICLE_MAKES.find(m => m.id === selectedMake);
    const modelObj = VEHICLE_MODELS.find(m => m.id === selectedModel);
    
    onSearchSubmit({
      make: makeObj?.name || 'Toyota',
      model: modelObj?.name || 'Hilux',
      year: selectedYear || '2018',
      engine: selectedEngine,
      keyword,
    });
  };

  const setQuickVehicle = (make: string, model: string, year: string, engine: string) => {
    setSelectedMake(make);
    setSelectedModel(model);
    setSelectedYear(year);
    setSelectedEngine(engine);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-2xl shadow-slate-950/80">
      
      {/* Header Tabs: Vehicle / VIN / OEM */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setSearchMode('vehicle')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              searchMode === 'vehicle'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Search by Vehicle</span>
          </button>

          <button
            onClick={() => setSearchMode('vin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              searchMode === 'vin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Search by VIN</span>
          </button>

          <button
            onClick={() => setSearchMode('oem')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              searchMode === 'oem'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>By OEM Part #</span>
          </button>
        </div>

        {/* Fitment Guarantee Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Guaranteed Fitment Protection</span>
        </div>
      </div>

      {/* Mode 1: Search By Vehicle */}
      {searchMode === 'vehicle' && (
        <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* 1. Make Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>1. Vehicle Make</span>
                <span className="text-[10px] text-amber-400 font-semibold">Step 1</span>
              </label>
              <div className="relative">
                <select
                  value={selectedMake}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full h-12 bg-slate-950 text-white font-medium text-sm px-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-10"
                  aria-label="Select vehicle make"
                >
                  {VEHICLE_MAKES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.logo} {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>

            {/* 2. Model Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>2. Vehicle Model</span>
                <span className="text-[10px] text-amber-400 font-semibold">Step 2</span>
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full h-12 bg-slate-950 text-white font-medium text-sm px-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-10"
                  aria-label="Select vehicle model"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>

            {/* 3. Year Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>3. Production Year</span>
                <span className="text-[10px] text-amber-400 font-semibold">Step 3</span>
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-12 bg-slate-950 text-white font-medium text-sm px-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-10"
                  aria-label="Select production year"
                >
                  {(currentModelData?.years || [2024, 2023, 2022, 2021, 2020, 2019, 2018]).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>

            {/* 4. Engine / Variant Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>4. Engine / Variant</span>
                <span className="text-[10px] text-amber-400 font-semibold">Step 4</span>
              </label>
              <div className="relative">
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="w-full h-12 bg-slate-950 text-white font-medium text-sm px-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-10"
                  aria-label="Select engine variant"
                >
                  {(currentModelData?.engines || ['Standard Engine']).map((eng) => (
                    <option key={eng} value={eng}>
                      {eng}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Keyword & Search CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Optional part name (e.g. Front Brake Pads, Alternator, Headlight)..."
                className="w-full h-12 bg-slate-950 text-white placeholder-slate-500 text-sm pl-11 pr-4 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                aria-label="Search by part name"
              />
            </div>

            <button
              type="submit"
              className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Find Compatible Parts</span>
            </button>
          </div>
        </form>
      )}

      {/* Mode 2: Search By VIN */}
      {searchMode === 'vin' && (
        <div className="mt-5 space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200">17-Character VIN Auto Match</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Your Vehicle Identification Number ensures 100% accurate OEM part fitment. Found on your SA License Disk or windscreen.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={17}
                value={vinNumber}
                onChange={(e) => setVinNumber(e.target.value.toUpperCase())}
                placeholder="Enter 17-character VIN (e.g. AHTFR22G901234567)"
                className="w-full h-12 bg-slate-950 text-white font-mono placeholder-slate-500 text-sm px-4 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 uppercase tracking-widest"
                aria-label="Enter VIN number"
              />
              <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-mono">
                {vinNumber.length}/17
              </span>
            </div>

            <button
              onClick={handleFormSubmit}
              disabled={vinNumber.length !== 17}
              className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Decode & Find Parts</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Search By OEM */}
      {searchMode === 'oem' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={oemNumber}
                onChange={(e) => setOemNumber(e.target.value)}
                placeholder="Enter OEM Part Number (e.g. 04465-0K280 or 5Q0-698-151-AH)"
                className="w-full h-12 bg-slate-950 text-white font-mono placeholder-slate-500 text-sm px-4 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                aria-label="Enter OEM part number"
              />
            </div>

            <button
              onClick={handleFormSubmit}
              className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Lookup OEM Part</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Select Vehicles & Request Quote Prompt */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap text-slate-400">
          <span className="font-semibold text-slate-300">Popular SA Rides:</span>
          <button
            type="button"
            onClick={() => setQuickVehicle('toyota', 'hilux', '2018', '2.8 GD-6 4x4 (150kW)')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 transition"
          >
            🚗 Hilux 2.8 GD-6
          </button>
          <button
            type="button"
            onClick={() => setQuickVehicle('vw', 'polo_vivo', '2017', '1.4 Trendline (55kW)')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 transition"
          >
            🏎️ VW Polo Vivo 1.4
          </button>
          <button
            type="button"
            onClick={() => setQuickVehicle('ford', 'ranger', '2019', '3.2 TDCi XLT 4x4')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 transition"
          >
            🚙 Ford Ranger 3.2
          </button>
        </div>

        <button
          onClick={onRequestQuoteClick}
          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline ml-auto"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Can't find your part? Request a Quote &rarr;</span>
        </button>
      </div>

    </div>
  );
};
