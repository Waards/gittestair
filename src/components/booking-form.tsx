'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Settings,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Wrench,
  AlertCircle
} from 'lucide-react'
import { submitLead } from '../app/actions/leads'
import { getAvailableTimeSlots } from '../app/actions/admin'
import { toast } from 'sonner'
import { validatePHPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils'

const services = [
  { id: 'installation', name: 'Aircon Installation', price: '₱15,000' },
  { id: 'inspection', name: 'Site Inspection', price: 'Free' },
  { id: 'cleaning', name: 'Aircon Cleaning', price: '₱2,500' },
  { id: 'repairs', name: 'Aircon Repairs', price: '₱1,500' },
  { id: 'dismantle', name: 'Dismantle', price: '₱2,000' },
  { id: 'relocation', name: 'Relocation', price: '₱3,500' },
  { id: 'freon', name: 'Freon Charging', price: '₱2,000' },
]

const allTimeSlots = [
  { value: '08:00 AM - 10:00 AM', label: '08:00 AM - 10:00 AM' },
  { value: '10:00 AM - 12:00 PM', label: '10:00 AM - 12:00 PM' },
  { value: '01:00 PM - 03:00 PM', label: '01:00 PM - 03:00 PM' },
  { value: '03:00 PM - 05:00 PM', label: '03:00 PM - 05:00 PM' },
  { value: '05:00 PM - 07:00 PM', label: '05:00 PM - 07:00 PM' },
  { value: '07:00 PM - 08:00 PM', label: '07:00 PM - 08:00 PM' },
]

interface BookingFormProps {
  trigger?: React.ReactNode
}

export function BookingForm({ trigger }: BookingFormProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    buildingName: '',
    floor: '',
    clientType: 'Residential',
    companyName: '',
    contactPerson: '',
    designation: '',
    numberOfUnits: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    additionalInfo: '',
    // Technical specs (Installation only)
    airconBrand: '',
    airconBrandOther: '',
    airconType: '',
    horsepower: '',
    btu: '',
    // Issue description (non-installation)
    issueDescription: '',
    specialInstructions: '',
  })

  const getFullAddress = () => {
    const parts = [
      formData.street,
      formData.barangay,
      formData.city,
      formData.zipCode
    ].filter(Boolean)
    return parts.join(', ')
  }

  const isInstallation = formData.serviceType === 'Aircon Installation'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 11)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (name === 'preferredDate' && value) {
      getAvailableTimeSlots(value).then(available => {
        const booked = allTimeSlots.filter(slot => !available.includes(slot.value)).map(s => s.value)
        setBookedSlots(booked)
      })
      setFormData(prev => ({ ...prev, preferredTime: '' }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

const nextStep = () => {
    if (step === 1) {
      // Validate required fields based on client type
      const required = formData.clientType === 'Corporate' 
        ? !formData.companyName || !formData.contactPerson || !formData.phone || !formData.email || !formData.street || !formData.barangay || !formData.city || !formData.province || !formData.buildingName || !formData.floor
        : !formData.fullName || !formData.phone || !formData.email || !formData.street || !formData.barangay || !formData.city
      
      if (required) {
        toast.error('Please fill in all required fields')
        return
      }
      if (!validatePHPhone(formData.phone)) {
        toast.error(PHONE_VALIDATION_ERROR)
        return
      }
    } else if (step === 2) {
      if (!formData.serviceType || !formData.preferredDate || !formData.preferredTime) {
        toast.error('Please fill in all required fields')
        return
      }
      if (isInstallation && (!formData.airconBrand || !formData.airconType || !formData.horsepower)) {
        toast.error('Please complete all required Technical Specifications')
        return
      }
      if (isInstallation && formData.airconBrand === 'Other' && !formData.airconBrandOther) {
        toast.error('Please specify the brand name')
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const data = new FormData()

    // Core fields - for Corporate, contactPerson becomes fullName
    data.append('fullName', formData.clientType === 'Corporate' ? formData.contactPerson : formData.fullName)
    data.append('phone', formData.phone)
    data.append('email', formData.email)
    data.append('street', formData.street)
    data.append('barangay', formData.barangay)
    data.append('city', formData.city)
    data.append('zipCode', formData.zipCode)
    data.append('clientType', formData.clientType)
    
    // Corporate fields
    if (formData.clientType === 'Corporate') {
      data.append('companyName', formData.companyName)
      data.append('contactPerson', formData.contactPerson)
      data.append('designation', formData.designation || '')
      data.append('buildingName', formData.buildingName)
      data.append('floor', formData.floor)
      data.append('province', formData.province)
      data.append('numberOfUnits', formData.numberOfUnits || '')
      data.append('specialInstructions', formData.specialInstructions || '')
    } else {
      data.append('companyName', '')
      data.append('contactPerson', '')
      data.append('designation', '')
      data.append('buildingName', '')
      data.append('floor', '')
      data.append('province', '')
      data.append('numberOfUnits', '')
      data.append('specialInstructions', '')
    }
    data.append('serviceType', formData.serviceType)
    data.append('preferredDate', formData.preferredDate)
    data.append('preferredTime', formData.preferredTime)

    // Build serviceAddress for backward compatibility
    data.append('serviceAddress', getFullAddress())

    // Aircon specifications (Installation only) - save as separate fields
    const finalBrand = formData.airconBrand === 'Other' ? formData.airconBrandOther : formData.airconBrand
    if (isInstallation) {
      data.append('airconBrand', finalBrand)
      data.append('airconType', formData.airconType)
      data.append('horsepower', formData.horsepower)
      data.append('btu', formData.btu || '')
      data.append('additionalInfo', formData.additionalInfo)
      data.append('unitBrandType', `${finalBrand} ${formData.airconType}`)
    } else {
      const combined = formData.issueDescription
        ? formData.issueDescription + (formData.additionalInfo ? `\n${formData.additionalInfo}` : '')
        : formData.additionalInfo
      data.append('additionalInfo', combined)
    }

    const result = await submitLead(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Booking request submitted successfully!')
      toast.info('Please check your email (or spam folder) for booking confirmation.')
      setIsOpen(false)
      setStep(1)
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        zipCode: '',
        buildingName: '',
        floor: '',
        clientType: 'Residential',
        companyName: '',
        contactPerson: '',
        designation: '',
        numberOfUnits: '',
        serviceType: '',
        preferredDate: '',
        preferredTime: '',
        additionalInfo: '',
        airconBrand: '',
        airconBrandOther: '',
        airconType: '',
        horsepower: '',
        btu: '',
        issueDescription: '',
        specialInstructions: '',
      })
    } else {
      toast.error(result.error || 'Failed to submit booking request')
    }
  }

  return (
    <>
      {!mounted ? (
        // Render trigger on server to prevent hydration mismatch
        <button 
          type="button"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-10 rounded-md px-6"
          onClick={() => setIsOpen(true)}
        >
          Book a Service
        </button>
      ) : (
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setStep(1)
          }
        }}>
          {trigger && (
            <div onClick={() => setIsOpen(true)}>
              {trigger}
            </div>
          )}
          {!trigger && (
            <DialogTrigger asChild>
              <Button className="bg-[#0062a3] hover:bg-[#0062a3]/90 text-white">Book a Service</Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-white border-b">
              <div className="flex justify-center items-center gap-8 mb-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${step === s ? 'bg-[#0062a3] text-white border-[#0062a3]' :
                        step > s ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                      {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && <div className={`w-12 h-[2px] mx-2 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>
              <DialogTitle className="text-center text-xl font-bold">
                {step === 1 && 'Client Information'}
                {step === 2 && 'Service Details'}
                {step === 3 && 'Review & Confirm'}
              </DialogTitle>
            </DialogHeader>

<div className="p-6 max-h-[70vh] overflow-y-auto">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#0062a3] mb-4">
                    <User className="w-5 h-5" />
                    <h3 className="font-semibold">Client Information</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Client Type *</Label>
                    <RadioGroup
                      value={formData.clientType}
                      onValueChange={(v) => handleSelectChange('clientType', v)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Residential" id="residential" />
                        <Label htmlFor="residential" className="font-normal">Residential</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Corporate" id="corporate" />
                        <Label htmlFor="corporate" className="font-normal">Corporate</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.clientType === 'Residential' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input id="fullName" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input id="phone" name="phone" placeholder="Phone Number" maxLength={11} value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input id="email" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input id="companyName" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person *</Label>
                        <Input id="contactPerson" name="contactPerson" placeholder="Contact Person Name" value={formData.contactPerson} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation / Position <span className="text-gray-400">(Optional)</span></Label>
                        <Input id="designation" name="designation" placeholder="e.g., Facility Manager" value={formData.designation} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="numberOfUnits">Number of Units <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="numberOfUnits" name="numberOfUnits" type="number" placeholder="e.g., 5" value={formData.numberOfUnits} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">Province *</Label>
                          <Input name="province" placeholder="e.g., Metro Manila" value={formData.province} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input id="phone" name="phone" placeholder="Phone Number" maxLength={11} value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input id="email" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Service Address *</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Street / House Number</Label>
                        <Input name="street" placeholder="e.g., 123 Main Street, Unit 5B" value={formData.street} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Barangay / District</Label>
                        <Input name="barangay" placeholder="e.g., San Lorenzo" value={formData.barangay} onChange={handleInputChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">City / Municipality</Label>
                          <Input name="city" placeholder="e.g., Makati City" value={formData.city} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">ZIP Code</Label>
                          <Input name="zipCode" placeholder="e.g., 1234" value={formData.zipCode} onChange={handleInputChange} maxLength={4} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="buildingName">Building Name *</Label>
                          <Input id="buildingName" name="buildingName" placeholder="e.g., Tower 1" value={formData.buildingName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="floor">Floor *</Label>
                          <Input id="floor" name="floor" placeholder="e.g., 5th Floor" value={formData.floor} onChange={handleInputChange} />
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#0062a3] mb-4">
                    <Settings className="w-5 h-5" />
                    <h3 className="font-semibold">Service Details</h3>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select value={formData.serviceType} onValueChange={(v) => {
                      handleSelectChange('serviceType', v)
                      // Reset tech specs when service type changes
                      setFormData(prev => ({ ...prev, airconBrand: '', airconType: '', horsepower: '', btu: '', issueDescription: '' }))
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            <div className="flex flex-col">
                              <span>{s.name}</span>
                              <span className="text-xs text-muted-foreground">Starting from {s.price}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ── INSTALLATION: Technical Specifications ── */}
                  {isInstallation && (
                    <div className="space-y-3 border border-[#0062a3]/20 rounded-lg p-4 bg-blue-50/40">
                      <div className="flex items-center gap-2 text-[#0062a3]">
                        <Wrench className="w-4 h-4" />
                        <h4 className="font-semibold text-sm">Technical Specifications</h4>
                        <span className="text-xs text-slate-500 ml-auto">Required for installation planning</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">Aircon Brand *</Label>
                          <Select value={formData.airconBrand} onValueChange={(v) => {
                            handleSelectChange('airconBrand', v)
                            if (v === 'Other') {
                              setFormData(prev => ({ ...prev, airconBrandOther: '', airconBrand: '' }))
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Aux', 'Midea', 'LG', 'Samsung', 'Daikin', 'Carrier', 'Panasonic', 'Hitachi', 'Sharp', 'Kelvinator', 'Other'].map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formData.airconBrand === 'Other' && (
                            <Input 
                              placeholder="Enter brand name"
                              value={formData.airconBrandOther}
                              onChange={(e) => setFormData(prev => ({ ...prev, airconBrandOther: e.target.value }))}
                              className="mt-2"
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Aircon Type *</Label>
                          <Select value={formData.airconType} onValueChange={(v) => handleSelectChange('airconType', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Window">Window</SelectItem>
                              <SelectItem value="Split">Split</SelectItem>
                              <SelectItem value="Inverter">Inverter</SelectItem>
                              <SelectItem value="Cassette">Cassette</SelectItem>
                              <SelectItem value="Console">Console</SelectItem>
                              <SelectItem value="Central">Central</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Horsepower (HP) *</Label>
                          <Select value={formData.horsepower} onValueChange={(v) => handleSelectChange('horsepower', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select HP" />
                            </SelectTrigger>
                            <SelectContent>
                              {['0.5 HP', '0.75 HP', '1.0 HP', '1.5 HP', '2.0 HP', '2.5 HP', '3.0 HP', '4.0 HP', '5.0 HP'].map(hp => (
                                <SelectItem key={hp} value={hp}>{hp}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">BTU</Label>
                          <Input
                            name="btu"
                            placeholder="e.g. 12000"
                            value={formData.btu || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── NON-INSTALLATION: Issue Description ── */}
                  {!isInstallation && formData.serviceType && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <Label className="text-sm font-semibold">Describe the Issue <span className="text-slate-400 font-normal">(Optional)</span></Label>
                      </div>
                      <Textarea
                        id="issueDescription"
                        name="issueDescription"
                        placeholder="e.g. AC is not cooling, making loud noise, leaking water..."
                        className="min-h-[80px]"
                        value={formData.issueDescription}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Preferred Date *</Label>
                      <Input
                        id="preferredDate"
                        name="preferredDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Time *</Label>
                      {bookedSlots.length >= allTimeSlots.length ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                          No available time slots for this date. Please select another date.
                        </div>
                      ) : (
                        <Select value={formData.preferredTime} onValueChange={(v) => handleSelectChange('preferredTime', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {allTimeSlots.map((slot) => {
                              const isBooked = bookedSlots.includes(slot.value)
                              return (
                                <SelectItem 
                                  key={slot.value} 
                                  value={slot.value}
                                  disabled={isBooked}
                                >
                                  <span className={isBooked ? 'text-slate-400 line-through' : ''}>
                                    {slot.label} {isBooked && '(Booked)'}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {(formData.clientType === 'Corporate' && isInstallation) && (
                    <div className="space-y-2">
                      <Label htmlFor="specialInstructions">
                        Special Instructions 
                        <span className="text-gray-400 font-normal">(Access requirements, parking details, etc.)</span>
                      </Label>
                      <Textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        placeholder="e.g., Parking available at basement. Please inform guard at lobby..."
                        className="min-h-[80px]"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">
                      {formData.clientType === 'Corporate' ? 'Additional Notes' : 'Additional Notes'}
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      placeholder="Any other details or special instructions..."
                      className="min-h-[80px]"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-[#0062a3] mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-semibold">Review & Confirm</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-xs text-slate-500 uppercase tracking-wider">Client Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <User className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <span>{formData.fullName}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Phone className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <span>{formData.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Mail className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <span className="break-all">{formData.email}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <div className="flex flex-col">
                            {formData.street && <span>{formData.street}</span>}
                            {formData.barangay && <span>{formData.barangay}, {formData.city}</span>}
                            {formData.zipCode && <span className="text-slate-500">{formData.zipCode}</span>}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Type: </span>
                          <span>{formData.clientType}</span>
                        </div>
                        {formData.clientType === 'Corporate' && formData.companyName && (
                          <>
                            <div className="flex items-start gap-2 text-sm mt-2">
                              <User className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                              <div className="flex flex-col">
                                <span className="font-medium">{formData.companyName}</span>
                                {formData.contactPerson && <span className="text-slate-500 text-xs">Contact: {formData.contactPerson}</span>}
                              </div>
                            </div>
                            {formData.buildingName && (
                              <div className="flex items-start gap-2 text-sm mt-1">
                                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                <div className="flex flex-col">
                                  <span>{formData.buildingName}{formData.floor ? `, ${formData.floor}` : ''}</span>
                                  {formData.province && <span className="text-slate-500 text-xs">{formData.province}</span>}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-xs text-slate-500 uppercase tracking-wider">Service Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <Settings className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{formData.serviceType}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Calendar className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <span>{formData.preferredDate}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Clock className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <span>{formData.preferredTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs summary (Installation only) */}
                  {isInstallation && (
                    <div className="border border-[#0062a3]/20 rounded-lg p-4 bg-blue-50/40 space-y-2">
                      <div className="flex items-center gap-2 text-[#0062a3] mb-1">
                        <Wrench className="w-4 h-4" />
                        <h4 className="font-semibold text-xs uppercase tracking-wider">Technical Specifications</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div><span className="text-slate-500">Brand: </span><span className="font-medium">{formData.airconBrand === 'Other' ? formData.airconBrandOther : formData.airconBrand}</span></div>
                        <div><span className="text-slate-500">Type: </span><span className="font-medium">{formData.airconType}</span></div>
                        <div><span className="text-slate-500">Horsepower: </span><span className="font-medium">{formData.horsepower}</span></div>
                        {formData.btu && <div><span className="text-slate-500">BTU: </span><span className="font-medium">{formData.btu}</span></div>}
                      </div>
                    </div>
                  )}

                  {/* Issue description summary (non-installation) */}
                  {!isInstallation && formData.issueDescription && (
                    <div className="border rounded-lg p-3 bg-slate-50 space-y-1">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Issue Description</p>
                      <p className="text-sm text-slate-700">{formData.issueDescription}</p>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-bold">Note:</span> This is a booking request. Our team will contact you within 24 hours to confirm your appointment and provide a detailed quote.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-between gap-4">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="px-6"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#0062a3] hover:bg-[#0062a3]/90 text-white px-8"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#0062a3] hover:bg-[#0062a3]/90 text-white px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
