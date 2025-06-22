'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CategoryItem {
  name: string
  slug: string
  searchTerm: string
  description: string
}

interface CategorySectionProps {
  title: string
  categories: CategoryItem[]
  className?: string
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  categories, 
  className = '' 
}) => {
  const router = useRouter()

  const handleCategoryClick = (category: CategoryItem) => {
    const searchParams = new URLSearchParams()
    searchParams.set('q', category.searchTerm)
    searchParams.set('type', category.slug)
    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <h2 className="font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <button
              onClick={() => handleCategoryClick(category)}
              className="text-blue-600 hover:underline text-sm w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              aria-label={`Search for ${category.name} - ${category.description}`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CategoryNavigation: React.FC = () => {
  const foodAssistanceCategories: CategoryItem[] = [
    {
      name: 'food banks',
      slug: 'food-banks',
      searchTerm: 'food bank',
      description: 'Large organizations that distribute food to smaller pantries and programs'
    },
    {
      name: 'food pantries',
      slug: 'food-pantries', 
      searchTerm: 'food pantry',
      description: 'Local organizations that provide groceries and food items'
    },
    {
      name: 'soup kitchens',
      slug: 'soup-kitchens',
      searchTerm: 'soup kitchen',
      description: 'Places that serve prepared hot meals'
    },
    {
      name: 'meal delivery',
      slug: 'meal-delivery',
      searchTerm: 'meal delivery',
      description: 'Services that deliver meals to homes'
    },
    {
      name: 'community gardens',
      slug: 'community-gardens',
      searchTerm: 'community garden',
      description: 'Shared spaces for growing fresh produce'
    },
    {
      name: 'senior services',
      slug: 'senior-services',
      searchTerm: 'senior meals',
      description: 'Food programs specifically for seniors'
    },
    {
      name: 'wic/snap assistance',
      slug: 'government-assistance',
      searchTerm: 'WIC SNAP',
      description: 'Government food assistance programs'
    }
  ]

  const resourceCategories: CategoryItem[] = [
    {
      name: 'nutrition education',
      slug: 'nutrition-education',
      searchTerm: 'nutrition education',
      description: 'Programs that teach healthy eating habits'
    },
    {
      name: 'cooking classes',
      slug: 'cooking-classes',
      searchTerm: 'cooking classes',
      description: 'Classes that teach food preparation skills'
    },
    {
      name: 'emergency assistance',
      slug: 'emergency-assistance',
      searchTerm: 'emergency food',
      description: 'Immediate food help for urgent situations'
    },
    {
      name: 'holiday programs',
      slug: 'holiday-programs',
      searchTerm: 'holiday meals',
      description: 'Special food programs during holidays'
    }
  ]

  return (
    <nav aria-label="Food assistance categories">
      <CategorySection
        title="food assistance"
        categories={foodAssistanceCategories}
        className="mb-4"
      />
      <CategorySection
        title="resources"
        categories={resourceCategories}
      />
    </nav>
  )
}

export default CategoryNavigation 