import React, { useState, useMemo } from 'react';
import {
  SUGGESTED_FIELDS_CATALOG,
  SuggestedFieldDefinition,
  getPlatformIcon,
} from '../utils/socialIcons';
import { VCardField, FieldCategory, FieldType } from '../types/vcard';
import { X, Search, Plus, Sparkles, Sliders } from 'lucide-react';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (field: VCardField) => void;
  existingKeys: string[];
}

export const AddFieldModal: React.FC<AddFieldModalProps> = ({
  isOpen,
  onClose,
  onAddField,
  existingKeys,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'custom'>('suggestions');

  // Custom field form state
  const [customLabel, setCustomLabel] = useState('');
  const [customType, setCustomType] = useState<FieldType>('url');
  const [customValue, setCustomValue] = useState('');
  const [customCategory, setCustomCategory] = useState<FieldCategory>('Other');

  const categories = ['All', 'Contact', 'Social Media', 'Professional', 'Other'];

  const filteredSuggestions = useMemo(() => {
    return SUGGESTED_FIELDS_CATALOG.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  const handleSelectSuggested = (item: SuggestedFieldDefinition) => {
    const newField: VCardField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: item.key,
      label: item.label,
      category: item.category,
      type: item.type,
      value: '',
      isVisible: true,
      placeholder: item.placeholder,
      prefixUrl: item.prefixUrl,
    };
    onAddField(newField);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;

    const safeKey = customLabel
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 24);

    const newField: VCardField = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: safeKey || `custom_${Date.now()}`,
      label: customLabel.trim(),
      category: customCategory,
      type: customType,
      value: customValue.trim(),
      isVisible: true,
      placeholder: customType === 'url' ? 'https://example.com' : 'Enter detail',
    };

    onAddField(newField);
    setCustomLabel('');
    setCustomValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#FFFCF7] rounded-3xl tactile-panel-lifted border border-[rgba(216,209,196,0.9)] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(224,218,206,0.7)] bg-[#FDFBF7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B80E8]" />
              <h2 className="text-lg font-bold text-[#30303B]">Add New Field</h2>
            </div>
            <p className="text-xs text-[#85818A] mt-0.5">
              Only Name and Phone are permanent. Choose from popular social links or create any custom field.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#85818A] hover:text-[#30303B] hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Suggestions and Custom */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-[rgba(224,218,206,0.5)] bg-[#FBF9F3]">
          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'suggestions'
                ? 'bg-white text-[#30303B] shadow-xs border border-[rgba(216,209,196,0.9)]'
                : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B80E8]" />
            <span>Suggested Fields</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-white text-[#30303B] shadow-xs border border-[rgba(216,209,196,0.9)]'
                : 'text-[#85818A] hover:text-[#30303B]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#8B80E8]" />
            <span>Create Custom Field</span>
          </button>
        </div>

        {/* Tab 1: Suggestions */}
        {activeTab === 'suggestions' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {/* Search Input & Category Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85818A] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fields (Instagram, WhatsApp, GitHub, Email, Portfolio...)"
                  className="tactile-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-[#30303B]"
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#30303B] text-white shadow-xs'
                        : 'bg-[#F5F2EB] text-[#85818A] hover:text-[#30303B] hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {filteredSuggestions.map((item) => {
                const isAlreadyAdded = existingKeys.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectSuggested(item)}
                    className="p-3 rounded-2xl border border-[rgba(216,209,196,0.7)] bg-[#FAF7F0] hover:bg-white hover:border-[#8B80E8] hover:shadow-xs transition-all flex items-start gap-3 text-left group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white border border-[rgba(216,209,196,0.8)] shadow-inner flex items-center justify-center shrink-0 text-[#30303B] group-hover:text-[#8B80E8] transition-colors">
                      {getPlatformIcon(item.key, 'w-5 h-5')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#30303B] truncate">
                          {item.label}
                        </span>
                        {isAlreadyAdded && (
                          <span className="text-[10px] text-[#85818A] bg-neutral-200/60 px-1.5 py-0.2 rounded-md">
                            Added
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#85818A] line-clamp-1 mt-0.5 leading-tight">
                        {item.description}
                      </p>
                    </div>

                    <Plus className="w-4 h-4 text-[#85818A] group-hover:text-[#8B80E8] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </button>
                );
              })}

              {filteredSuggestions.length === 0 && (
                <div className="col-span-full py-10 text-center space-y-2">
                  <p className="text-xs text-[#85818A]">
                    No standard template found matching "{search}".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLabel(search);
                      setActiveTab('custom');
                    }}
                    className="tactile-btn-primary px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Create "{search}" as a Custom Field
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Field Creator */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCreateCustom} className="p-6 flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#30303B] block mb-1.5">
                Field Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. Booking Link, Substack, Behance, Spotify, License #"
                className="tactile-input w-full px-3.5 py-2.5 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#30303B] block mb-1.5">
                  Field Type
                </label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as FieldType)}
                  className="tactile-input w-full px-3 py-2.5 rounded-xl text-xs bg-white"
                >
                  <option value="url">Web Link (URL)</option>
                  <option value="text">Text Note / Info</option>
                  <option value="email">Email Address</option>
                  <option value="phone">Phone / Number</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#30303B] block mb-1.5">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as FieldCategory)}
                  className="tactile-input w-full px-3 py-2.5 rounded-xl text-xs bg-white"
                >
                  <option value="Social Media">Social Media</option>
                  <option value="Professional">Professional</option>
                  <option value="Contact">Contact</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#30303B] block mb-1.5">
                Default / Initial Value (Optional)
              </label>
              <input
                type={customType === 'email' ? 'email' : 'text'}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={
                  customType === 'url'
                    ? 'https://your-service.com/user'
                    : 'Enter value'
                }
                className="tactile-input w-full px-3.5 py-2.5 rounded-xl text-xs"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[rgba(224,218,206,0.6)]">
              <button
                type="button"
                onClick={onClose}
                className="tactile-btn-secondary px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!customLabel.trim()}
                className="tactile-btn-primary px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Add Custom Field
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
