export function getEstimatedDurationInMinutes(serviceType: string = '', notes: string = '', title: string = ''): number {
  const combinedText = `${serviceType} ${notes} ${title}`.toLowerCase()

  // 1. Aircon Installation - 4 to 8 hours (using 6 hours / 360 minutes as default for 10% per hour)
  if (combinedText.includes('install') || serviceType.toLowerCase() === 'installation') {
    if (combinedText.includes('window')) return 360; // 6 hours (standard window type)
    if (combinedText.includes('multi') || combinedText.includes('ducted') || combinedText.includes('central')) return 600; // 10 hours (complex)
    if (combinedText.includes('split')) return 360; // 6 hours (standard split type)
    return 360; // Default installation: 6 hours (for 10% per hour = 60 min per 10%)
  }

  // 2. Aircon Maintenance / Cleaning - 30 min to 2 hours
  if (combinedText.includes('clean') || combinedText.includes('maintenance')) {
    if (combinedText.includes('basic') || combinedText.includes('filter')) return 60; // 1 hour
    if (combinedText.includes('chemical')) return 120; // 2 hours
    if (combinedText.includes('overhaul') || combinedText.includes('full')) return 180; // 3 hours
    return 90; // General cleaning: 1.5 hours (90 min for ~10% per 15 min)
  }

  // 3. Aircon Repairs - 30 min to 2 hours
  if (combinedText.includes('repair')) {
    if (combinedText.includes('minor') || combinedText.includes('sensor') || combinedText.includes('capacitor') || combinedText.includes('filter')) return 60; // 1 hour
    if (combinedText.includes('major') || combinedText.includes('compressor') || combinedText.includes('leak') || combinedText.includes('electrical')) return 150; // 2.5 hours
    return 90; // Moderate repair: 1.5 hours
  }

  // Default duration for any unknown service type - 1.5 hours
  return 90;
}

export function calculateDynamicProgress(item: { status?: string, date?: string, time?: string, service_type?: string, title?: string, notes?: string, [key: string]: any }): number {
  const status = (item.status || '').toLowerCase()
  
  if (status === 'completed' || status === 'finished') return 100
  if (status === 'rejected' || status === 'cancelled') return 0
  if (status === 'pending') return 10
  if (status === 'scheduled') return 20
  if (status === 'in progress') {
    if (!item.date || !item.time) return 50

    try {
      const startTimeStr = `${item.date}T${item.time}`
      const startTime = new Date(startTimeStr).getTime()
      if (isNaN(startTime)) return 50

      const now = Date.now()
      if (now < startTime) return 25

      const elapsedMinutes = (now - startTime) / 60000
      const totalEstimatedMinutes = getEstimatedDurationInMinutes(item.service_type, item.notes, item.title)
      
      const baseProgress = 20
      const maxProgress = 95
      const progressRange = maxProgress - baseProgress
      
      const calculatedProgress = baseProgress + ((elapsedMinutes / totalEstimatedMinutes) * progressRange)
      return Math.min(Math.max(calculatedProgress, 20), 95)
    } catch (e) {
      return 50
    }
  }

  return 10
}
