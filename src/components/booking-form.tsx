'use client'

import React, { useState } from 'react'
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
  ChevronLeft
} from 'lucide-react'
import { submitLead } from '../app/actions/leads'
import { toast } from 'sonner'
import { validatePHPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils'

const services = [
  { id: 'installation', name: 'Aircon Installation', price: '₱15,000' },
  { id: 'cleaning', name: 'Aircon Cleaning', price: '₱2,500' },
  { id: 'repairs', name: 'Aircon Repairs', price: '₱1,500' },
  { id: 'dismantle', name: 'Dismantle', price: '₱2,000' },
  { id: 'relocation', name: 'Relocation', price: '₱3,500' },
  { id: 'freon', name: 'Freon Charging', price: '₱2,000' },
]

const timeSlots = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
]

interface BookingFormProps {
  trigger?: React.ReactNode
}

export function BookingForm({ trigger }: BookingFormProps) {
  const [step, setStep] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceAddress: '',
    clientType: 'Residential',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    additionalInfo: ''
  })

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
      if (!formData.fullName || !formData.phone || !formData.email || !formData.serviceAddress) {
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
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value)
    })

    const result = await submitLead(data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('Booking request submitted successfully!')
      setIsOpen(false)
      setStep(1)
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        serviceAddress: '',
        clientType: 'Residential',
        serviceType: '',
        preferredDate: '',
        preferredTime: '',
        additionalInfo: ''
      })
    } else {
      toast.error(result.error || 'Failed to submit booking request')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        setStep(1)
      }
    }}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-[#0062a3] hover:bg-[#0062a3]/90 text-white">Book a Service</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-white border-b">
          <div className="flex justify-center items-center gap-8 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                  step === s ? 'bg-[#0062a3] text-white border-[#0062a3]' : 
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
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      placeholder="Full Name" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      placeholder="Phone Number" 
                      maxLength={11}
                      value={formData.phone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Email Address" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceAddress">Service Address *</Label>
                  <Textarea 
                    id="serviceAddress" 
                    name="serviceAddress" 
                    placeholder="Service Address" 
                    className="min-h-[100px]"
                  value={formData.serviceAddress} 
                  onChange={handleInputChange} 
                />
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#0062a3] mb-4">
                <Settings className="w-5 h-5" />
                <h3 className="font-semibold">Service Details</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={(v) => handleSelectChange('serviceType', v)}>
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
                  <Select value={formData.preferredTime} onValueChange={(v) => handleSelectChange('preferredTime', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea 
                  id="additionalInfo" 
                  name="additionalInfo" 
                  placeholder="Enter additional information..." 
                  className="min-h-[100px]"
                  value={formData.additionalInfo} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#0062a3] mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-semibold">Review & Confirm</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Client Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <User className="w-4 h-4 mt-0.5 text-slate-400" />
                      <span>{formData.fullName}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="w-4 h-4 mt-0.5 text-slate-400" />
                      <span>{formData.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="w-4 h-4 mt-0.5 text-slate-400" />
                      <span className="break-all">{formData.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                      <span>{formData.serviceAddress}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-500">Type: </span>
                      <span>{formData.clientType}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Service Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Settings className="w-4 h-4 mt-0.5 text-slate-400" />
                      <span>{formData.serviceType}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="w-4 h-4 mt-0.5 text-slate-400" />
                      <span>{formData.preferredDate}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="w-4 h-4 mt-0.5 text-slate-400" />
                      <span>{formData.preferredTime}</span>
                    </div>
                  </div>
                </div>
              </div>

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
  )
}
