'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const itemLabel = (item) => item.title || item.name || item.role || `item #${item.id}`

function ItemColumns({ item, columns, getBadgeColor, getTypeIcon }) {
  if (!columns || !columns.length) return null
  const normalized = columns.map((col) => (typeof col === 'string' ? { key: col, label: col } : col))
  return normalized
    .filter((col) => col.key !== 'featured' && col.key !== 'sort_order')
    .map((col, idx) => (
      <div key={idx} className="shrink-0 max-w-full">
        {col.render ? (
          col.render(item[col.key], item)
        ) : col.key === 'thumbnail_url' || col.key === 'cover_image_url' || col.key === 'image_url' ? (
          item[col.key] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item[col.key]}
              alt={item.title || item.name || item.role || 'Thumbnail'}
              className="w-10 h-10 object-cover rounded-lg border border-white/10"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
              <i className="ri-image-line text-gray-500 text-sm"></i>
            </div>
          )
        ) : col.key === 'type' ? (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getBadgeColor ? getBadgeColor(item[col.key]) : 'bg-white/5 text-gray-300 border border-white/10'
            }`}
          >
            {getTypeIcon && <i className={getTypeIcon(item[col.key])}></i>}
            {item[col.key]}
          </span>
        ) : col.key === 'status' ? (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item[col.key] === 'completed' || item[col.key]?.toLowerCase?.().includes('aktif')
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : item[col.key] === 'wip'
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            {item[col.key] || '-'}
          </span>
        ) : col.key === 'title' || col.key === 'name' || col.key === 'role' ? (
          <span className="text-white text-sm font-semibold truncate max-w-[240px] block">
            {item[col.key] || '-'}
          </span>
        ) : typeof item[col.key] === 'boolean' ? (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              item[col.key]
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-white/5 text-gray-500 border border-white/10'
            }`}
          >
            {item[col.key] ? 'Ya' : 'Tidak'}
          </span>
        ) : (
          <span className="text-gray-300 text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 font-mono">
            {item[col.key] != null && item[col.key] !== '' ? String(item[col.key]) : '-'}
          </span>
        )}
      </div>
    ))
}


function SortableItem({ item, onEdit, onDelete, getBadgeColor, getTypeIcon, columns }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSorting ? 'none' : transition,
    opacity: isSorting ? 0.8 : 1,
    zIndex: isSorting ? 50 : 'auto',
    position: isSorting ? 'relative' : 'static',
  }

  if (item.isDivider) {
    return (
      <div ref={setNodeRef} style={style} className={`py-6 ${isSorting ? 'z-50' : ''}`}>
        <div className="flex items-center gap-3 px-2 group cursor-grab active:cursor-grabbing touch-none" {...attributes} {...listeners} aria-label="Geser pembatas untuk mengatur item featured">
          <div className="flex-1 border-t-2 border-dashed border-gray-600 group-hover:border-blue-500 transition-colors"></div>
          <span className="text-xs font-bold text-gray-500 group-hover:text-blue-400 transition-colors flex items-center gap-1 bg-gray-900 px-2 py-1 rounded shadow-sm">
            <i className="ri-draggable"></i>
            FEATURED DI ATAS · ARSIP DI BAWAH
          </span>
          <div className="flex-1 border-t-2 border-dashed border-gray-600 group-hover:border-blue-500 transition-colors"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl px-5 py-4 border border-white/10 hover:border-white/20 transition-colors duration-300 group shadow-md hover:shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Mobile Header (Drag & Actions) */}
        <div className="flex items-center justify-between sm:hidden w-full mb-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-500 hover:text-gray-300 transition-colors touch-none"
            aria-label="Geser untuk mengurutkan"
          >
            <i className="ri-draggable text-xl"></i>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-2 text-gray-400 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              aria-label={`Edit ${itemLabel(item)}`}
            >
              <i className="ri-edit-line text-lg"></i>
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              aria-label={`Hapus ${itemLabel(item)}`}
            >
              <i className="ri-delete-bin-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Desktop Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="hidden sm:flex items-center justify-center cursor-grab active:cursor-grabbing p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all touch-none"
          aria-label="Geser untuk mengurutkan"
        >
          <i className="ri-draggable text-xl"></i>
        </button>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 min-w-0">
          <ItemColumns item={item} columns={columns} getBadgeColor={getBadgeColor} getTypeIcon={getTypeIcon} />
          {item.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-900/20 text-amber-400 border border-amber-800/30 mt-1 sm:mt-0">
              <i className="ri-star-s-fill text-[10px]"></i>
              Featured
            </span>
          )}
        </div>

        {/* Visible on touch/keyboard; fades in on hover only for fine pointers */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={() => onEdit(item)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-accent bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            aria-label={`Edit ${itemLabel(item)}`}
          >
            <i className="ri-edit-line text-lg"></i>
          </button>
          <button
            onClick={() => onDelete(item)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all"
            aria-label={`Hapus ${itemLabel(item)}`}
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

function NonSortableItem({ item, onEdit, onDelete, getBadgeColor, getTypeIcon, columns }) {
  if (item.isDivider) return null;

  return (
    <div className="bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl px-5 py-4 border border-white/10 hover:border-white/20 transition-all duration-300 group shadow-md hover:shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Mobile Actions */}
        <div className="flex items-center justify-end sm:hidden w-full mb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="p-2 text-gray-400 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              aria-label={`Edit ${itemLabel(item)}`}
            >
              <i className="ri-edit-line text-lg"></i>
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              aria-label={`Hapus ${itemLabel(item)}`}
            >
              <i className="ri-delete-bin-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 min-w-0 pl-1">
          <ItemColumns item={item} columns={columns} getBadgeColor={getBadgeColor} getTypeIcon={getTypeIcon} />
          {item.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-900/20 text-amber-400 border border-amber-800/30 mt-1 sm:mt-0">
              <i className="ri-star-s-fill text-[10px]"></i>
              Featured
            </span>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-gray-400 hover:text-accent bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            aria-label={`Edit ${itemLabel(item)}`}
          >
            <i className="ri-edit-line text-lg"></i>
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
            aria-label={`Hapus ${itemLabel(item)}`}
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

// Main DragDropList Component
export default function DragDropList({ data, onUpdate, onEdit, onDelete, getBadgeColor, getTypeIcon, columns: rawColumns, featuredLimit = null, enableFeaturedDrag = false, disableDrag = false }) {
  const [items, setItems] = useState([])

  // Normalize columns: support both string[] and object[] formats
  const columns = (rawColumns || []).map(col =>
    typeof col === 'string' ? { key: col } : col
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const dataKeyRef = useRef('')

  useEffect(() => {
    // Stable sort keeps insertion order for rows without sort_order (ids may be UUIDs)
    const sorted = [...data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    
    let result
    if (enableFeaturedDrag) {
      const itemsWithoutDivider = sorted.filter(item => !item.isDivider)
      let dividerIndex = itemsWithoutDivider.length
      for (let i = 0; i < itemsWithoutDivider.length; i++) {
        if (!itemsWithoutDivider[i].featured) {
          dividerIndex = i;
          break;
        }
      }
      itemsWithoutDivider.splice(dividerIndex, 0, { id: 'FEATURED_DIVIDER', isDivider: true })
      result = itemsWithoutDivider
    } else {
      result = sorted
    }

    // Resync when order, featured flag or content changes (edits must show up without reload)
    const key = JSON.stringify(result)
    if (dataKeyRef.current !== key) {
      dataKeyRef.current = key
      setItems(result)
    }
  }, [data, enableFeaturedDrag])

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex)

    let currentSortOrder = 0
    let isAboveDivider = true
    const updated = []
    
    for (let i = 0; i < reordered.length; i++) {
      const item = reordered[i]
      if (item.isDivider) {
        isAboveDivider = false
        continue
      }
      
      const updatedItem = {
        ...item,
        sort_order: currentSortOrder,
      }
      
      if (enableFeaturedDrag) {
        updatedItem.featured = isAboveDivider
      } else if (featuredLimit !== null) {
        updatedItem.featured = currentSortOrder < featuredLimit
      }
      
      updated.push(updatedItem)
      currentSortOrder++
    }

    const previous = items
    // Show the new featured state immediately, not only the new order
    const updatedById = new Map(updated.map(i => [i.id, i]))
    setItems(reordered.map(i => updatedById.get(i.id) ?? i))

    try {
      await onUpdate(updated)
    } catch {
      setItems(previous) // Revert on failure; caller already showed the error
    }
  }

  const featuredCount = items.filter((item) => item.featured).length

  return (
    <div>
      {/* Featured info */}
      {featuredLimit !== null && !enableFeaturedDrag && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>{featuredLimit} item teratas tampil sebagai featured</span>
          <span>{featuredCount}/{featuredLimit} featured</span>
        </div>
      )}
      {enableFeaturedDrag && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Drag pembatas (divider) untuk mengatur jumlah item featured</span>
          <span>{featuredCount} item featured</span>
        </div>
      )}

      {disableDrag ? (
        <div className="space-y-3 mt-4">
          {items.map((item) => (
            <div key={item.id} className="mb-1.5 last:mb-0">
              <NonSortableItem
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                getBadgeColor={getBadgeColor}
                getTypeIcon={getTypeIcon}
                columns={columns}
              />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="mb-1.5 last:mb-0">
                <SortableItem
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getBadgeColor={getBadgeColor}
                  getTypeIcon={getTypeIcon}
                  columns={columns}
                />

                {/* Featured divider */}
                {featuredLimit !== null && !enableFeaturedDrag && index === featuredLimit - 1 && items.length > featuredLimit && (
                  <div className="flex items-center gap-3 my-3 px-2">
                    <div className="flex-1 border-t border-dashed border-gray-700"></div>
                    <span className="text-xs text-gray-600 shrink-0">featured di atas · arsip di bawah</span>
                    <div className="flex-1 border-t border-dashed border-gray-700"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      )}
    </div>
  )
}
