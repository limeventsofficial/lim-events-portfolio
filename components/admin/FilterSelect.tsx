'use client'

import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import styles from './FilterSelect.module.css'

interface FilterSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function FilterSelect({ value, onChange, options, placeholder = 'Select...' }: FilterSelectProps) {
  return (
    <Select.Root value={value || 'all'} onValueChange={(val) => onChange(val === 'all' ? null : val)}>
      <Select.Trigger className={`${styles.trigger} ${styles.baseSelect}`} aria-label={placeholder}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className={styles.icon}>
          <ChevronDown size={16} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={4}>
          <Select.Viewport className={styles.viewport}>
            <Select.Item value="all" className={styles.item}>
              <Select.ItemText>All Services</Select.ItemText>
              <Select.ItemIndicator className={styles.indicator}>
                <Check size={14} />
              </Select.ItemIndicator>
            </Select.Item>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} className={styles.item}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className={styles.indicator}>
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
