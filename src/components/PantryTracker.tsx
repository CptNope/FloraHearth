import React, { useState } from 'react';
import { DialogBehavior } from './DialogBehavior';
import { PantryItem, UserPreferences } from '../types/garden';
import {
  ShoppingCart,
  Utensils,
  Users,
  Sparkles,
  AlertCircle,
  Plus,
  Check,
  Edit2,
  Trash2,
  MinusCircle,
  AlertTriangle,
  Clock,
  Calendar,
  X
} from 'lucide-react';
import { localDateStr, daysUntil } from '../services/dates';

interface PantryTrackerProps {
  pantryItems: PantryItem[];
  preferences: UserPreferences;
  onAddPantryItem?: (item: PantryItem) => void;
  onUpdatePantryItem?: (item: PantryItem) => void;
  onDeletePantryItem?: (id: string) => void;
  onUseOneJar?: (id: string) => void;
}

export const PantryTracker: React.FC<PantryTrackerProps> = ({
  pantryItems,
  preferences,
  onAddPantryItem,
  onUpdatePantryItem,
  onDeletePantryItem,
  onUseOneJar,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'calculator' | 'alerts' | 'meals' | 'shopping'>('inventory');
  const [householdSize, setHouseholdSize] = useState<number>(preferences.householdSize || 3);

  // Edit / Add Item state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  const [formCropName, setFormCropName] = useState('');
  const [formPreservationType, setFormPreservationType] = useState<PantryItem['preservationType']>('water-bath-canned');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('quart jars');
  const [formDatePrepared, setFormDatePrepared] = useState(localDateStr());
  const [formBestByDate, setFormBestByDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return localDateStr(d);
  });
  const [formLocation, setFormLocation] = useState<PantryItem['storageLocation']>('Pantry Shelf');
  const [formNotes, setFormNotes] = useState('');

  const openAddItemModal = () => {
    setEditingItem(null);
    setFormCropName('');
    setFormPreservationType('water-bath-canned');
    setFormQuantity(4);
    setFormUnit('quart jars');
    setFormDatePrepared(localDateStr());
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormBestByDate(localDateStr(nextYear));
    setFormLocation('Pantry Shelf');
    setFormNotes('');
    setIsEditModalOpen(true);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setFormCropName(item.cropName);
    setFormPreservationType(item.preservationType);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit);
    setFormDatePrepared(item.datePrepared);
    setFormBestByDate(item.bestByDate);
    setFormLocation(item.storageLocation);
    setFormNotes(item.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCropName.trim()) return;

    const payload: PantryItem = {
      id: editingItem ? editingItem.id : `pantry-${Date.now()}`,
      cropName: formCropName.trim(),
      preservationType: formPreservationType,
      quantity: Math.max(1, formQuantity),
      unit: formUnit.trim() || 'units',
      datePrepared: formDatePrepared,
      bestByDate: formBestByDate,
      storageLocation: formLocation,
      notes: formNotes.trim(),
    };

    if (editingItem && onUpdatePantryItem) {
      onUpdatePantryItem(payload);
    } else if (onAddPantryItem) {
      onAddPantryItem(payload);
    }
    setIsEditModalOpen(false);
  };

  const handleUseJar = (item: PantryItem) => {
    if (onUseOneJar) {
      onUseOneJar(item.id);
    } else if (onUpdatePantryItem && onDeletePantryItem) {
      if (item.quantity <= 1) {
        if (confirm(`You're using the last ${item.unit} of "${item.cropName}". Remove it from your pantry inventory?`)) {
          onDeletePantryItem(item.id);
        }
      } else {
        onUpdatePantryItem({ ...item, quantity: item.quantity - 1 });
      }
    }
  };

  // Expiration calculations
  const getDaysUntil = (dateStr: string) => daysUntil(dateStr);

  const itemsWithExpiry = pantryItems.map(item => ({
    ...item,
    daysUntilExpiry: getDaysUntil(item.bestByDate),
  }));

  const expiringSoonItems = itemsWithExpiry.filter(item => item.daysUntilExpiry <= 30);

  // How long preserved produce lasts at ~2 side servings per person per day (not a calorie estimate)
  // Estimate servings: quart jars ~ 4 servings; pints ~ 2 servings; lbs ~ 4 servings; bulbs ~ 8 servings
  const totalServingsEstimate = pantryItems.reduce((acc, item) => {
    const unitLower = item.unit.toLowerCase();
    let servingsPerUnit = 3;
    if (unitLower.includes('quart')) servingsPerUnit = 4;
    else if (unitLower.includes('pint')) servingsPerUnit = 2;
    else if (unitLower.includes('lb') || unitLower.includes('bag')) servingsPerUnit = 4;
    else if (unitLower.includes('bulb')) servingsPerUnit = 8;
    return acc + (item.quantity * servingsPerUnit);
  }, 0);

  // Assuming each family member consumes ~2 preserved servings/day alongside pantry staples
  const dailyServingsPerHousehold = Math.max(1, householdSize * 2);
  const daysOfFoodOnHand = Math.round(totalServingsEstimate / dailyServingsPerHousehold);
  const monthsOfFoodOnHand = (daysOfFoodOnHand / 30.5).toFixed(1);

  // Household Planting Quantity Benchmarks
  const familyPlanningBenchmarks = [
    {
      crop: 'Tomatoes (Slicing & Sauce)',
      freshEatingPerPerson: '3 to 5 plants',
      preservationPerPerson: '5 to 10 plants (~15-25 qts sauce/person)',
      calculatedFresh: (householdSize * 4),
      calculatedPreserve: (householdSize * 8),
      yieldNotes: 'Assumes 15 lbs fruit per indeterminate plant. 3 lbs fresh tomatoes = 1 quart canned sauce.',
    },
    {
      crop: 'Snap Green Beans',
      freshEatingPerPerson: '8 to 12 plants (or 10 ft row)',
      preservationPerPerson: '15 to 20 plants (~15-20 pints frozen/canned)',
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

  const [supplyChecklist, setSupplyChecklist] = useState<{ id: string; name: string; checked: boolean }[]>([
    { id: 'sup-1', name: 'Standard Mason Jars (Pints & Quarts with smooth rims)', checked: true },
    { id: 'sup-2', name: 'New 2-piece Canning Lids & Bands (Lids cannot be reused for canning)', checked: true },
    { id: 'sup-3', name: 'Jar Lifter & Bubble Freer / Headspace Measurement Gauge', checked: true },
    { id: 'sup-4', name: 'Bottled Lemon Juice (5% acidity for acidification)', checked: true },
    { id: 'sup-5', name: 'Pickling / Canning Salt (pure NaCl without iodine or anti-caking additives)', checked: true },
    { id: 'sup-6', name: 'Heavy Boiling Water Canner with Elevating Rack', checked: false },
    { id: 'sup-7', name: 'Weighted Gauge Pressure Canner (for low-acid vegetables, beans, broth)', checked: false },
  ]);

  const toggleSupply = (id: string) => {
    setSupplyChecklist(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#223d2e]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#183a24] dark:text-[#e4efe7] font-serif-botanical">
            Pantry Inventory, Food Security &amp; Batch Tracker
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
            Track preserved pantry stores, log jar usage, audit expiration dates, and see how long your preserved produce will last.
          </p>
        </div>

        <div className="flex flex-wrap bg-stone-100 dark:bg-[#111c15] p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Pantry Stores ({pantryItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 relative ${
              activeTab === 'alerts' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Pantry Alerts</span>
            {expiringSoonItems.length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-300 text-amber-950 dark:bg-amber-400 dark:text-amber-950 rounded-full text-[10px] font-bold">
                {expiringSoonItems.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'calculator' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Family Benchmarks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meals')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'meals' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            Harvest Meals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shopping')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'shopping' ? 'bg-white dark:bg-[#183e25] text-stone-900 dark:text-white shadow-2xs font-bold' : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-stone-500" />
            <span>Canning Supplies</span>
          </button>
        </div>
      </div>

      {/* Household Food On Hand Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-950/5 via-emerald-900/10 to-emerald-950/5 dark:from-emerald-950/40 dark:to-emerald-900/30 border border-emerald-500/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-700/15 text-emerald-800 dark:text-emerald-300 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase text-emerald-800 dark:text-emerald-400">
                Preserved Produce on Hand:
              </span>
              <span className="font-extrabold text-base text-[#183a24] dark:text-white font-mono">
                ~{monthsOfFoodOnHand} months of side servings
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              About {totalServingsEstimate} servings of fruit and vegetables from {pantryItems.reduce((acc, i) => acc + i.quantity, 0)} containers, at 2 servings per person per day for {householdSize} {householdSize === 1 ? 'person' : 'people'}. This counts produce only, not total calories or a full diet.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddItemModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422] transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Item</span>
        </button>
      </div>

      {/* TAB 1: Pantry Inventory (with Used 1 Jar, Edit, Delete) */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {pantryItems.length === 0 ? (
            <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-8 text-center text-stone-500 space-y-2">
              <Utensils className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs">Your pantry is currently empty.</p>
              <button
                type="button"
                onClick={openAddItemModal}
                className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold underline"
              >
                Add your first canned or preserved batch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pantryItems.map(item => {
                const daysUntil = getDaysUntil(item.bestByDate);
                const isExpiringSoon = daysUntil <= 30 && daysUntil > 0;
                const isExpired = daysUntil <= 0;

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-[#132219] border rounded-2xl p-4 shadow-xs space-y-3 text-xs transition-all ${
                      isExpired
                        ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-300/40'
                        : isExpiringSoon
                        ? 'border-amber-300 dark:border-amber-800/60 ring-1 ring-amber-300/40'
                        : 'border-stone-200 dark:border-[#223d2e]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <h2 className="font-bold text-stone-900 dark:text-white text-sm leading-tight break-words">
                          {item.cropName}
                        </h2>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                          Prep: {item.datePrepared}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md font-mono text-[10px] font-semibold shrink-0">
                        {item.preservationType}
                      </span>
                    </div>

                    {/* Quantity & "Used 1 Jar" Action */}
                    <div className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-[#182c20] rounded-xl border border-stone-200/70 dark:border-[#223d2e]">
                      <div>
                        <span className="text-xl font-extrabold text-[#183a24] dark:text-[#34d399] font-mono">
                          {item.quantity}
                        </span>{' '}
                        <span className="text-stone-600 dark:text-stone-300 font-medium">
                          {item.unit}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUseJar(item)}
                        title="Use 1 jar / decrement count"
                        aria-label={`Use 1 ${item.unit} of ${item.cropName}`}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-[#122118] border border-stone-300 dark:border-[#223d2e] hover:border-emerald-600 dark:hover:border-emerald-500 text-stone-700 dark:text-stone-200 hover:text-emerald-800 rounded-lg transition-colors shadow-2xs"
                      >
                        <MinusCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>Used 1</span>
                      </button>
                    </div>

                    <div className="space-y-1 text-[11px] text-stone-600 dark:text-stone-300 pt-1">
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <strong className="text-stone-800 dark:text-stone-200">{item.storageLocation}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Use By:</span>
                        <span className="font-mono font-bold">
                          {item.bestByDate}{' '}
                          {isExpired ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">(Expired)</span>
                          ) : isExpiringSoon ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">({daysUntil}d left)</span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic line-clamp-2">
                        {item.notes}
                      </p>
                    )}

                    {/* Card Footer: Edit & Delete buttons */}
                    <div className="flex items-center justify-end gap-1 pt-2 border-t border-stone-100 dark:border-[#223d2e]">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        aria-label={`Edit ${item.cropName}`}
                        className="p-1 text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove "${item.cropName}" from pantry?`)) {
                            onDeletePantryItem?.(item.id);
                          }
                        }}
                        aria-label={`Delete ${item.cropName}`}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Expiration & Pantry Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">
                  Pantry Freshness &amp; Expiration Audit (30-Day Window)
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Prioritize consuming or freezing batches approaching their optimal safe quality window.
                </p>
              </div>
            </div>

            {itemsWithExpiry.length === 0 ? (
              <p className="text-xs text-stone-500">No pantry items logged.</p>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-[#223d2e]">
                {itemsWithExpiry
                  .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
                  .map(item => {
                    const isExpired = item.daysUntilExpiry <= 0;
                    const isUrgent = item.daysUntilExpiry <= 30;

                    return (
                      <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isExpired ? 'bg-rose-500' : isUrgent ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <div>
                            <strong className="text-stone-900 dark:text-white">{item.cropName}</strong>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">
                              {item.quantity} {item.unit} · {item.storageLocation} ({item.preservationType})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-mono text-stone-700 dark:text-stone-300 block">
                              Best by: {item.bestByDate}
                            </span>
                            <span className={`text-[10px] font-bold ${isExpired ? 'text-rose-600' : isUrgent ? 'text-amber-600' : 'text-emerald-700'}`}>
                              {isExpired ? 'EXPIRED' : `${item.daysUntilExpiry} days remaining`}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUseJar(item)}
                            className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#182c20] text-stone-700 dark:text-stone-200 rounded-lg transition-colors"
                          >
                            Used 1
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Household Family Calculator */}
      {activeTab === 'calculator' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-sm text-[#183a24] dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                How Much Should I Plant for My Family?
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                Adjust household size to compute required plant counts for fresh summer eating versus full winter pantry food security.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#f4f7f4] dark:bg-[#182c20] border border-[#d6e4da] dark:border-[#223d2e] p-2 rounded-xl text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Household:</span>
              <input aria-label="Household size (people)"
                type="number"
                min="1"
                max="10"
                value={householdSize}
                onChange={e => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 px-2 py-1 text-center font-bold text-emerald-950 dark:text-white font-mono bg-white dark:bg-[#122118] border border-stone-300 dark:border-[#223d2e] rounded-lg"
              />
              <span className="text-stone-600 dark:text-stone-300">people</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyPlanningBenchmarks.map(item => (
              <div key={item.crop} className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-4 shadow-2xs space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#183a24] dark:text-white">{item.crop}</h3>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-[#f6f8f6] dark:bg-[#182c20] p-2.5 rounded-xl border border-stone-200 dark:border-[#223d2e]">
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Fresh Eating Only</span>
                    <span className="text-lg font-extrabold text-[#183a24] dark:text-white font-mono">
                      {Math.ceil(item.calculatedFresh)}
                    </span>
                    <span className="text-[10px] text-stone-400 block">plants</span>
                  </div>

                  <div className="bg-[#f0f5f1] dark:bg-[#12291c] p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] text-emerald-900 dark:text-emerald-300 block font-semibold">Fresh + Winter Canning</span>
                    <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-400 font-mono">
                      {Math.ceil(item.calculatedPreserve)}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">plants</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 dark:text-stone-300 pt-1 border-t border-stone-100 dark:border-[#223d2e]">
                  <span className="text-stone-400 block text-[10px]">Extension Yield Assumption:</span>
                  {item.yieldNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Harvest Meals */}
      {activeTab === 'meals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {harvestMealIdeas.map(meal => (
            <div key={meal.title} className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-stone-100 dark:bg-[#182c20] text-stone-600 dark:text-stone-300 rounded-md font-medium text-[10px]">
                  {meal.season}
                </span>
                <span className="text-stone-400 font-mono text-[11px]">{meal.prepTime}</span>
              </div>

              <h3 className="font-bold text-sm text-[#183a24] dark:text-white">{meal.title}</h3>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">{meal.description}</p>

              <div className="pt-2 border-t border-stone-100 dark:border-[#223d2e] space-y-1">
                <div className="text-[11px]">
                  <strong className="text-emerald-900 dark:text-emerald-300">From the Garden:</strong>{' '}
                  <span className="text-stone-700 dark:text-stone-300">{meal.primaryIngredients.join(', ')}</span>
                </div>
                <div className="text-[11px]">
                  <strong className="text-stone-700 dark:text-stone-300">Pantry Staples Needed:</strong>{' '}
                  <span className="text-stone-500 dark:text-stone-400">{meal.pantryAdds.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Supplies Checklist */}
      {activeTab === 'shopping' && (
        <div className="bg-white dark:bg-[#132219] border border-stone-200 dark:border-[#223d2e] rounded-2xl p-6 shadow-xs max-w-xl mx-auto space-y-4 text-xs">
          <div>
            <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              Essential Food Preservation Supply Checklist
            </h2>
            <p className="text-stone-600 dark:text-stone-300 mt-0.5">
              Ensure you have tested supplies ready before your peak harvest flushes arrive.
            </p>
          </div>

          <div className="space-y-2">
            {supplyChecklist.map(item => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-[#223d2e] hover:bg-stone-50 dark:hover:bg-[#182c20] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleSupply(item.id)}
                  className="rounded-xs text-emerald-700 accent-emerald-700 w-4 h-4"
                />
                <span className={`text-xs ${item.checked ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200 font-medium'}`}>
                  {item.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <DialogBehavior onClose={() => setIsEditModalOpen(false)} />
          <div className="bg-white dark:bg-[#112117] border border-stone-200 dark:border-[#223d2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#223d2e] pb-3">
              <h2 className="font-bold text-sm text-[#183a24] dark:text-white font-serif-botanical">
                {editingItem ? 'Edit Pantry Batch' : 'Add Pantry Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Item / Batch Name</label>
                <input aria-label="Item / Batch Name"
                  type="text"
                  required
                  value={formCropName}
                  onChange={e => setFormCropName(e.target.value)}
                  placeholder="e.g. Canned San Marzano Sauce"
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Preservation Method</label>
                  <select aria-label="Preservation Method"
                    value={formPreservationType}
                    onChange={e => setFormPreservationType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="water-bath-canned">Water Bath Canned</option>
                    <option value="pressure-canned">Pressure Canned</option>
                    <option value="frozen">Frozen</option>
                    <option value="dehydrated">Dehydrated</option>
                    <option value="fermented">Fermented</option>
                    <option value="cured-storage">Cured Root Storage</option>
                    <option value="fresh">Fresh Storage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Storage Location</label>
                  <select aria-label="Storage Location"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  >
                    <option value="Pantry Shelf">Pantry Shelf</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Root Cellar">Root Cellar</option>
                    <option value="Crisper">Refrigerator Crisper</option>
                    <option value="Cool Dark Closet">Cool Dark Closet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Quantity</label>
                  <input aria-label="Quantity"
                    type="number"
                    min="1"
                    required
                    value={formQuantity}
                    onChange={e => setFormQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Unit</label>
                  <input aria-label="Unit"
                    type="text"
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value)}
                    placeholder="e.g. quart jars, lbs, bulbs"
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Date Prepared</label>
                  <input aria-label="Date Prepared"
                    type="date"
                    required
                    value={formDatePrepared}
                    onChange={e => setFormDatePrepared(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Best By Date</label>
                  <input aria-label="Best By Date"
                    type="date"
                    required
                    value={formBestByDate}
                    onChange={e => setFormBestByDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Notes / Tested Recipe</label>
                <textarea aria-label="Notes / Tested Recipe"
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Acidified with 2 tbsp lemon juice/qt. Processed 45 min."
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-[#223d2e] dark:bg-[#182c20] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-[#223d2e]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#182c20] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#234730] text-white rounded-xl hover:bg-[#183422]"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
