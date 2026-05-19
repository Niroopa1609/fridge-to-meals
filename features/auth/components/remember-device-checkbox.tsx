"use client"

import { Checkbox } from "@/components/ui/checkbox"

export function RememberDeviceCheckbox({
  id,
  checked,
  onCheckedChange,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="border-[#E2D9CC] data-[state=checked]:border-[#F97316] data-[state=checked]:bg-[#F97316] data-[state=checked]:text-white"
      />
      <label htmlFor={id} className="cursor-pointer text-xs font-medium text-[#1F3A2B]/70">
        Remember this device
      </label>
    </div>
  )
}
