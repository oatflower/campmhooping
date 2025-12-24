import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface CategoryPillsProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const CategoryPills = ({ selectedCategory, onCategorySelect }: CategoryPillsProps) => {
  const { t } = useTranslation();

  const categories = [
    { id: 'near-bangkok', labelKey: 'categories.nearBangkok', icon: '🌲' },
    { id: 'glamping', labelKey: 'categories.glamping', icon: '🛖' },
    { id: 'mountain-view', labelKey: 'categories.mountainView', icon: '🌄' },
    { id: 'pet-friendly', labelKey: 'categories.petFriendly', icon: '🐶' },
    { id: 'family', labelKey: 'categories.family', icon: '👨‍👩‍👧‍👦' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(selectedCategory === category.id ? null : category.id)}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300",
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground border-primary shadow-md"
              : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary"
          )}
        >
          <span className="text-base">{category.icon}</span>
          <span className="text-sm font-medium whitespace-nowrap">{t(category.labelKey)}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;
