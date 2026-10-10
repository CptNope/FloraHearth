import React, { useState } from 'react';
import { PantryItem, UserPreferences } from '../types/garden';
import { ShoppingCart, Utensils, Users, Sparkles, AlertCircle, Plus, Check } from 'lucide-react';

interface PantryTrackerProps {
  pantryItems: PantryItem[];
  preferences: UserPreferences;
}

export const PantryTracker: React.FC<PantryTrackerProps> = ({
  pantryItems,
  preferences,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'meals' | 'calculator' | 'shopping'>('calculator');
  const [householdSize, setHouseholdSize] = useState<number>(preferences.householdSize || 3);

  // Household Planting Quantity Benchmarks (Authoritative University Extension data, e.g. Penn State / Utah State)
  const familyPlanningBenchmarks = [
    {
      crop: 'Tomatoes (Slicing & Sauce)',
      freshEatingPerPerson: '3 to 5 plants',
      preservationPerPerson: '5 to 10 plants (yields ~15-25 qts canned sauce/person)',
      calculatedFresh: (householdSize * 4),
      calculatedPreserve: (householdSize * 8),
      yieldNotes: 'Assumes 15 lbs fruit per indeterminate plant. 3 lbs fresh tomatoes = 1 quart canned sauce.',
    },
    {
      crop: 'Snap Green Beans',
      freshEatingPerPerson: '8 to 12 plants (or 10 ft row)',
      preservationPerPerson: '15 to 20 plants (yields ~15-20 pints frozen/canned)',
      calculatedFresh: (householdSize * 10),
      calculatedPreserve: (householdSize * 18),
      yieldNotes: 'Assumes ~0.75 lb beans per plant. 1.5 lbs = 1 quart canned jar.',
    },
    {
      crop: 'Bell Peppers',
      freshEatingPerPerson: '2 to 3 plants',
      preservationPerPerson: '3 to 5 plants (freeze diced, pickled rings)',
      calculatedFresh: (householdSize * 2.5),
      calculatedPreserve: (householdSize * 4),
      yieldNotes: 'Yields 6-10 peppers per plant across season.',
    },
    {
      crop: 'Garlic',
      freshEatingPerPerson: '12 to 15 cloves',
      preservationPerPerson: '25 to 30 cloves for year-round pantry storage',
      calculatedFresh: (householdSize * 12),
      calculatedPreserve: (householdSize * 25),
      yieldNotes: '1 planted clove = 1 whole winter storage bulb.',
    },
    {
      crop: 'Carrots',
      freshEatingPerPerson: '20 to 30 roots (2-3 ft row)',
      preservationPerPerson: '50 roots for cellar & pressure canning',
      calculatedFresh: (householdSize * 25),
      calculatedPreserve: (householdSize * 50),
      yieldNotes: '16 carrots per sq ft in loose soil.',
    },
    {
      crop: 'Kale & Chard',
      freshEatingPerPerson: '2 to 3 plants (cut-and-come-again)',
      preservationPerPerson: '4 to 6 plants for blanched freezer bags',
      calculatedFresh: (householdSize * 2),
      calculatedPreserve: (householdSize * 4),
      yieldNotes: 'Continuous harvest from spring through hard frost.',
    }
  ];

  // Seasonal meal ideas synthesized from homegrown harvests
  const harvestMealIdeas = [
    {
      title: 'Garden Fresh Caprese & Roasted Tomato Bruschetta',
      primaryIngredients: ['Fresh Tomatoes', 'Basil', 'Garlic'],
      pantryAdds: ['Olive Oil', 'Fresh Mozzarella', 'Balsamic Glaze', 'Crusty Baguette'],
      season: 'Mid Summer - Early Fall',
      prepTime: '15 mins',
      description: 'Highlight peak-season Sun Gold & Cherokee Purple tomatoes with fresh Genovese basil.'
    },
    {
      title: 'Tuscan White Bean & Lacinato Kale Stew',
      primaryIngredients: ['Lacinato Kale', 'Storage Garlic', 'Rosemary'],
      pantryAdds: ['Cannellini Beans', 'Vegetable Broth', 'Parmesan Rind', 'Carrots'],
      season: 'Autumn / Winter',
      prepTime: '35 mins',
      description: 'Hearty cold-weather comfort soup enriched by frost-sweetened kale greens.'
    },
    {
      title: 'Garden Stir-Fry with Snap Beans & Crisp Sweet Peppers',
      primaryIngredients: ['Bush Green Beans', 'Sweet Peppers', 'Radishes'],
      pantryAdds: ['Tamari / Soy Sauce', 'Sesame Oil', 'Ginger', 'Rice or Noodles'],
      season: 'Summer',
      prepTime: '20 mins',
      description: 'Fast, vibrant high-heat wok meal showcasing crisp, fresh garden pods.'
    }
  ];

  // Supply Checklist for Preservation
  const [supplyChecklist, setSupplyChecklist] = useState<{ id: string; name: string; checked: boolean }[]>([
    { id: 'sup-1', name: 'Standard Mason Jars (Pints & Quarts with smooth rims)', checked: true },
    { id: 'sup-2', name: 'New 2-piece Canning Lids & Bands (Lids cannot be reused for canning)', checked: true },
    { id: 'sup-3', name: 'Bottled Lemon Juice (Commercial 5% acidity for tomatoes)', checked: false },
    { id: 'sup-4', name: 'Non-iodized Pure Pickling / Kosher Salt', checked: false },
    { id: 'sup-5', name: 'White Vinegar or Apple Cider Vinegar (Minimum 5% acidity)', checked: true },
    { id: 'sup-6', name: 'Jar Lifter & Bubble Remover Wand', checked: true },
    { id: 'sup-7', name: 'Glass Fermentation Weights & Airlock Lids', checked: false },
    { id: 'sup-8', name: 'Heavy-Duty Freezer Vacuum Seal Bags', checked: false },
  ]);

  const toggleSupply = (id: string) => {
    setSupplyChecklist(supplyChecklist.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#183a24] font-serif-botanical">
            Pantry Inventory, Meal &amp; Yield Planning
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Calculate exact crop plant counts for your household, track preserved pantry stores, and craft seasonal harvest meals.
          </p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'calculator' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Family Yield Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Pantry Stores ({pantryItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meals')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'meals' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Harvest Meals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shopping')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'shopping' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
            }`}
          >
            Preservation Supplies
          </button>
        </div>
      </div>

      {/* TAB 1: Household Planting Yield Calculator */}
      {activeTab === 'calculator' && (
        <div className="space-y-5">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-[#183a24] flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                How Much Should I Plant for My Family?
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Adjust household size to compute required plant counts for fresh summer eating versus full winter pantry food security.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#f4f7f4] border border-[#d6e4da] p-2 rounded-xl text-xs">
              <span className="font-semibold text-stone-700">Household:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={householdSize}
                onChange={e => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 px-2 py-1 text-center font-bold text-emerald-950 font-mono bg-white border border-stone-300 rounded-lg"
              />
              <span className="text-stone-600">people</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyPlanningBenchmarks.map(item => (
              <div key={item.crop} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3 text-xs">
                <h4 className="font-bold text-sm text-[#183a24]">{item.crop}</h4>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-[#f6f8f6] p-2.5 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">Fresh Eating Only</span>
                    <span className="text-lg font-extrabold text-[#183a24] font-mono">
                      {Math.ceil(item.calculatedFresh)}
                    </span>
                    <span className="text-[10px] text-stone-400 block">plants</span>
                  </div>

                  <div className="bg-[#f0f5f1] p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-900 block font-semibold">Fresh + Winter Canning</span>
                    <span className="text-lg font-extrabold text-emerald-800 font-mono">
                      {Math.ceil(item.calculatedPreserve)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block">plants</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                  <span className="text-stone-400 block text-[10px]">Extension Yield Assumption:</span>
                  {item.yieldNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Pantry Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pantryItems.map(item => (
              <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">{item.cropName}</h4>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-mono text-[10px] font-semibold">
                    {item.preservationType}
                  </span>
                </div>

                <div className="text-stone-700">
                  <span className="text-lg font-bold text-[#183a24] font-mono">{item.quantity}</span> {item.unit}
                </div>

                <div className="flex justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                  <span>Location: {item.storageLocation}</span>
                  <span>Use By: <strong>{item.bestByDate}</strong></span>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-stone-600 italic">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Harvest Meals */}
      {activeTab === 'meals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {harvestMealIdeas.map(meal => (
            <div key={meal.title} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md font-medium text-[10px]">
                  {meal.season}
                </span>
                <span className="text-stone-400 font-mono text-[11px]">{meal.prepTime}</span>
              </div>

              <h4 className="font-bold text-sm text-[#183a24]">{meal.title}</h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">{meal.description}</p>

              <div className="pt-2 border-t border-stone-100 space-y-1">
                <div className="text-[11px]">
                  <strong className="text-emerald-900">From the Garden:</strong>{' '}
                  <span className="text-stone-700">{meal.primaryIngredients.join(', ')}</span>
                </div>
                <div className="text-[11px]">
                  <strong className="text-stone-700">Pantry Staples Needed:</strong>{' '}
                  <span className="text-stone-500">{meal.pantryAdds.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Supplies Checklist */}
      {activeTab === 'shopping' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs max-w-xl mx-auto space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#183a24] font-serif-botanical flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-800" />
              Essential Food Preservation Supply Checklist
            </h3>
            <p className="text-stone-600 mt-0.5">
              Ensure you have tested supplies ready before your peak harvest flushes arrive.
            </p>
          </div>

          <div className="space-y-2">
            {supplyChecklist.map(item => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleSupply(item.id)}
                  className="rounded-xs text-emerald-700 accent-emerald-700 w-4 h-4"
                />
                <span className={`text-xs ${item.checked ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}`}>
                  {item.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
