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
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { submitLead } from '../app/actions/leads'
import { toast } from 'sonner'
import { validatePHPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils'

interface BookingFormProps {
  trigger?: React.ReactNode
}

export function BookingForm({ trigger }: BookingFormProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
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
  })

  const getFullAddress = () => {
    const parts = [
      formData.street,
      formData.barangay,
      formData.city,
      formData.province,
      formData.zipCode
    ].filter(Boolean)
    return parts.join(', ')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 11)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
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
        : !formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.street || !formData.barangay || !formData.city

      if (required) {
        toast.error('Please fill in all required fields')
        return
      }
      if (!validatePHPhone(formData.phone)) {
        toast.error(PHONE_VALIDATION_ERROR)
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const data = new FormData()

    const fullName = formData.clientType === 'Corporate'
      ? formData.contactPerson
      : [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ')
    data.append('fullName', fullName)
    data.append('firstName', formData.firstName)
    data.append('middleName', formData.middleName)
    data.append('lastName', formData.lastName)
    data.append('suffix', formData.suffix)
    data.append('phone', formData.phone)
    data.append('email', formData.email)
    data.append('street', formData.street)
    data.append('barangay', formData.barangay)
    data.append('city', formData.city)
    data.append('province', formData.province)
    data.append('zipCode', formData.zipCode)
    data.append('clientType', formData.clientType)

    // Corporate fields
    if (formData.clientType === 'Corporate') {
      data.append('companyName', formData.companyName)
      data.append('contactPerson', formData.contactPerson)
      data.append('designation', formData.designation || '')
      data.append('buildingName', formData.buildingName)
      data.append('floor', formData.floor)
      data.append('numberOfUnits', formData.numberOfUnits || '')
    }
    data.append('serviceType', '')

    // Build serviceAddress for backward compatibility
    data.append('serviceAddress', getFullAddress())

    const result = await submitLead(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Booking request submitted successfully!')
      toast.info('Please check your email (or spam folder) for booking confirmation.')
      setIsOpen(false)
      setStep(1)
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
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
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${step === s ? 'bg-[#0062a3] text-white border-[#0062a3]' :
                        step > s ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                      {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                    </div>
                    {s < 2 && <div className={`w-12 h-[2px] mx-2 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>
              <DialogTitle className="text-center text-xl font-bold">
                {step === 1 && 'Client Information'}
                {step === 2 && 'Review & Confirm'}
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
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input id="firstName" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="middleName">Middle Name <span className="text-gray-400">(Optional)</span></Label>
                          <Input id="middleName" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input id="lastName" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="suffix">Suffix <span className="text-gray-400">(Optional)</span></Label>
                          <select
                            id="suffix"
                            name="suffix"
                            value={formData.suffix}
                            onChange={(e) => handleInputChange(e as any)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">None</option>
                            <option value="Jr.">Jr.</option>
                            <option value="Sr.">Sr.</option>
                            <option value="II">II</option>
                            <option value="III">III</option>
                            <option value="IV">IV</option>
                          </select>
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
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">City / Municipality</Label>
                          <Input name="city" placeholder="e.g., Makati City" value={formData.city} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Province</Label>
                          <Input name="province" placeholder="e.g., Metro Manila" value={formData.province} onChange={handleInputChange} />
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
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-[#0062a3] mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-semibold">Review & Confirm</h3>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-xs text-slate-500 uppercase tracking-wider">Client Information</h4>
                    <div className="space-y-2">
                      {(formData.firstName || formData.middleName || formData.lastName) && (
                        <div className="flex items-start gap-2 text-sm">
                          <User className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                          <span>{[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ')}{formData.suffix ? `, ${formData.suffix}` : ''}</span>
                        </div>
                      )}
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
                          {formData.province && <span className="text-slate-500">{formData.province}</span>}
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

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      <span className="font-bold">Note:</span> This is a booking request. Our team will contact you within 24 hours to confirm your appointment schedule and provide a detailed quote.
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

              {step < 2 ? (
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
