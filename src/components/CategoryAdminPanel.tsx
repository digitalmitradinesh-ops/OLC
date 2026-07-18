import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Layers, 
  Sparkles, 
  FolderOpen,
  Smartphone, 
  Car, 
  Home as HomeIcon, 
  Tv, 
  Briefcase, 
  Armchair, 
  BookOpen, 
  Music, 
  Activity, 
  ShoppingBag, 
  Heart, 
  HelpCircle,
  X,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';
import { Category, Subcategory, Listing } from '../types';

// Predefined set of Lucide icons that admins can choose from for categories
const ICON_OPTIONS = [
  { name: 'Smartphone', component: Smartphone, label: 'Mobiles & Tech' },
  { name: 'Car', component: Car, label: 'Vehicles & Transport' },
  { name: 'Home', component: HomeIcon, label: 'Properties & Housing' },
  { name: 'Tv', component: Tv, label: 'Electronics & TV' },
  { name: 'Briefcase', component: Briefcase, label: 'Jobs & Placement' },
  { name: 'Armchair', component: Armchair, label: 'Furniture & Decor' },
  { name: 'BookOpen', component: BookOpen, label: 'Books & Learning' },
  { name: 'Music', component: Music, label: 'Music & Hobbies' },
  { name: 'Activity', component: Activity, label: 'Sports & Health' },
  { name: 'ShoppingBag', component: ShoppingBag, label: 'Shopping & Fashion' },
  { name: 'Heart', component: Heart, label: 'Services & Care' },
  { name: 'HelpCircle', component: HelpCircle, label: 'Other/General' },
];

interface CategoryAdminPanelProps {
  categories: Category[];
  onUpdateCategories: (newCategories: Category[]) => void;
  listings: Listing[];
  showToast: (msg: string) => void;
}

export default function CategoryAdminPanel({ 
  categories, 
  onUpdateCategories, 
  listings, 
  showToast 
}: CategoryAdminPanelProps) {
  // Navigation & selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Add Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('HelpCircle');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Add Subcategory form state
  const [newSubName, setNewSubName] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);

  // Deletion prompt / modal state
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [subToDelete, setSubToDelete] = useState<{ catId: string; sub: Subcategory } | null>(null);

  // Selected Category object
  const activeCategory = categories.find(c => c.id === selectedCategoryId) || null;

  // Search filter
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    c.subcategories.some(s => s.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
  );

  // Slug generator helper
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // Create Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Please enter a valid category name.');
      return;
    }

    const slug = generateSlug(newCatName);
    
    // Check for duplicates
    if (categories.some(c => c.slug === slug || c.name.toLowerCase() === newCatName.toLowerCase().trim())) {
      showToast('A category with this name or slug already exists.');
      return;
    }

    const newId = `cat-${Date.now()}`;
    const newCategory: Category = {
      id: newId,
      name: newCatName.trim(),
      slug,
      icon: newCatIcon,
      subcategories: []
    };

    const updatedCategories = [...categories, newCategory];
    onUpdateCategories(updatedCategories);
    setSelectedCategoryId(newId);
    setNewCatName('');
    setNewCatIcon('HelpCircle');
    setIsAddingCat(false);
    showToast(`Category "${newCategory.name}" created successfully!`);
  };

  // Create Subcategory Handler
  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !activeCategory) {
      showToast('No parent category selected.');
      return;
    }
    if (!newSubName.trim()) {
      showToast('Please enter a valid subcategory name.');
      return;
    }

    const slug = generateSlug(newSubName);

    // Check for duplicate subcategory within this category
    if (activeCategory.subcategories.some(s => s.slug === slug || s.name.toLowerCase() === newSubName.toLowerCase().trim())) {
      showToast('This subcategory already exists under this category.');
      return;
    }

    const newSub: Subcategory = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      slug
    };

    const updatedCategories = categories.map(c => {
      if (c.id === selectedCategoryId) {
        return {
          ...c,
          subcategories: [...c.subcategories, newSub]
        };
      }
      return c;
    });

    onUpdateCategories(updatedCategories);
    setNewSubName('');
    setIsAddingSub(false);
    showToast(`Subcategory "${newSub.name}" added successfully!`);
  };

  // Delete Category confirmation
  const triggerDeleteCategory = (cat: Category) => {
    setCatToDelete(cat);
  };

  // Confirm delete Category
  const confirmDeleteCategory = () => {
    if (!catToDelete) return;
    
    const updatedCategories = categories.filter(c => c.id !== catToDelete.id);
    onUpdateCategories(updatedCategories);
    
    // Reset active category selection
    if (selectedCategoryId === catToDelete.id) {
      setSelectedCategoryId(updatedCategories.length > 0 ? updatedCategories[0].id : null);
    }
    
    setCatToDelete(null);
    showToast(`Category "${catToDelete.name}" successfully deleted.`);
  };

  // Delete Subcategory confirmation
  const triggerDeleteSubcategory = (catId: string, sub: Subcategory) => {
    setSubToDelete({ catId, sub });
  };

  // Confirm delete Subcategory
  const confirmDeleteSubcategory = () => {
    if (!subToDelete) return;

    const { catId, sub } = subToDelete;
    const updatedCategories = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          subcategories: c.subcategories.filter(s => s.id !== sub.id)
        };
      }
      return c;
    });

    onUpdateCategories(updatedCategories);
    setSubToDelete(null);
    showToast(`Subcategory "${sub.name}" successfully deleted.`);
  };

  // Helper to count active listings in a category
  const getCategoryListingsCount = (catId: string) => {
    return listings.filter(l => l.categoryId === catId).length;
  };

  // Helper to count listings in a subcategory
  const getSubcategoryListingsCount = (subId: string) => {
    return listings.filter(l => l.subcategoryId === subId).length;
  };

  // Icon preview component
  const CategoryIconPreview = ({ iconName, className = "w-5 h-5" }: { iconName: string; className?: string }) => {
    const iconObj = ICON_OPTIONS.find(o => o.name === iconName) || ICON_OPTIONS[ICON_OPTIONS.length - 1];
    const Component = iconObj.component;
    return <Component className={className} />;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Dynamic Category & Subcategory Hub</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create and edit unlimited categories and subcategories. Changes instantly propagate to the live filters and listing post forms.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="text-center">
            <div className="text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider font-extrabold">Total Categories</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">{categories.length}</div>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="text-center">
            <div className="text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider font-extrabold">Subcategories</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {categories.reduce((acc, c) => acc + c.subcategories.length, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Category List & Creation (span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Categories</span>
              <button
                type="button"
                onClick={() => setIsAddingCat(!isAddingCat)}
                className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 rounded-lg transition-all flex items-center gap-1 border border-indigo-100 dark:border-indigo-900/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingCat ? 'Close Form' : 'New Category'}</span>
              </button>
            </div>

            {/* Add Category Form */}
            {isAddingCat && (
              <form onSubmit={handleAddCategory} className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Category
                </h4>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sports, Toys, Gardening"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Category Icon</label>
                  <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl scrollbar-none">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComp = opt.component;
                      const isSelected = newCatIcon === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setNewCatIcon(opt.name)}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                            isSelected 
                              ? 'bg-indigo-600 text-white shadow-xs' 
                              : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                          }`}
                          title={opt.label}
                        >
                          <IconComp className="w-4 h-4" />
                          <span className="text-[8px] font-bold truncate max-w-full">{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Save Category
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingCat(false); setNewCatName(''); }}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Search Categories */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories / subcategories..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Category Listing Container */}
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  No matching categories found.
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  const count = getCategoryListingsCount(cat.id);
                  return (
                    <div 
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`group w-full p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-2xs' 
                          : 'bg-white dark:bg-slate-950 border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                        }`}>
                          <CategoryIconPreview iconName={cat.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-black ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>
                            {cat.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                            <span>{cat.subcategories.length} subcategories</span>
                            <span>•</span>
                            <span className={count > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                              {count} ads
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDeleteCategory(cat);
                          }}
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg transition cursor-pointer border border-rose-100/50 dark:border-rose-900/30"
                          title={`Delete ${cat.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Selected Category Detail & Subcategories (span 7) */}
        <div className="lg:col-span-7 space-y-4">
          {activeCategory ? (
            <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              
              {/* Active Category Header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-850 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-2xs">
                    <CategoryIconPreview iconName={activeCategory.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {activeCategory.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      <span>ID: {activeCategory.id}</span>
                      <span>•</span>
                      <span>Slug: /{activeCategory.slug}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingSub(!isAddingSub)}
                  className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-lg transition-all flex items-center gap-1 border border-emerald-100 dark:border-emerald-900/40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingSub ? 'Close Form' : 'New Subcategory'}</span>
                </button>
              </div>

              {/* Add Subcategory Form */}
              {isAddingSub && (
                <form onSubmit={handleAddSubcategory} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Create Subcategory under "{activeCategory.name}"
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Subcategory Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Electric Guitars, Bicycles, Gardening Tools"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500 font-medium text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Save Subcategory
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsAddingSub(false); setNewSubName(''); }}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Subcategories Header list */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  Subcategories ({activeCategory.subcategories.length})
                </span>

                {activeCategory.subcategories.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                      This category currently does not have any subcategories.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddingSub(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10.5px] rounded-lg transition shadow-xs"
                    >
                      Add First Subcategory
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                    {activeCategory.subcategories.map((sub) => {
                      const count = getSubcategoryListingsCount(sub.id);
                      return (
                        <div 
                          key={sub.id}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-3 rounded-xl flex items-center justify-between group/sub"
                        >
                          <div>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                              {sub.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 mt-0.5">
                              <span>/{sub.slug}</span>
                              <span>•</span>
                              <span className={count > 0 ? 'text-emerald-600 font-bold' : ''}>
                                {count} ads
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => triggerDeleteSubcategory(activeCategory.id, sub)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all opacity-0 group-hover/sub:opacity-100 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 cursor-pointer"
                            title={`Delete subcategory: ${sub.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-xs h-full flex flex-col items-center justify-center min-h-[300px]">
              <FolderOpen className="w-12 h-12 text-slate-200 dark:text-slate-800" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">No Active Category Selection</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
                Create a new category from the left form or select an existing one to manage its unlimited subcategories.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Category Delete Confirmation warning */}
      {catToDelete && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-rose-150 dark:border-rose-950/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-base uppercase tracking-wider">Delete Category?</h4>
            </div>

            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Are you absolutely sure you want to delete the category <strong className="text-slate-800 dark:text-slate-200">"{catToDelete.name}"</strong>? This will remove its ID <code className="font-mono bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">{catToDelete.id}</code> and all associated subcategories.
              </p>

              {getCategoryListingsCount(catToDelete.id) > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 p-3 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-normal flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Warning: There are currently <strong>{getCategoryListingsCount(catToDelete.id)} active advertisements</strong> listed under this category! These listings will remain intact but may lose category categorization.
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
              >
                Yes, Delete Category
              </button>
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Subcategory Delete Confirmation warning */}
      {subToDelete && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-950 border border-rose-150 dark:border-rose-950/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-base uppercase tracking-wider">Delete Subcategory?</h4>
            </div>

            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Are you absolutely sure you want to delete the subcategory <strong className="text-slate-800 dark:text-slate-200">"{subToDelete.sub.name}"</strong>?
              </p>

              {getSubcategoryListingsCount(subToDelete.sub.id) > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 p-3 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-normal flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Warning: There are currently <strong>{getSubcategoryListingsCount(subToDelete.sub.id)} active advertisements</strong> listed under this subcategory!
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={confirmDeleteSubcategory}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
              >
                Yes, Delete Subcategory
              </button>
              <button
                type="button"
                onClick={() => setSubToDelete(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
