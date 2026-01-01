import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  const email = 'admin@airconone.com'
  const password = 'Admin123!'
  const fullName = 'System Admin'

  console.log(`Creating admin account: ${email}`)

  // 1. Create user in auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('Admin user already exists in auth.users')
      
      // Try to find the user to update profile
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users.users.find(u => u.email === email)
      
      if (existingUser) {
        await updateProfile(existingUser.id, email, fullName)
      }
    } else {
      console.error('Error creating auth user:', authError.message)
      process.exit(1)
    }
  } else if (authData.user) {
    console.log('Auth user created successfully:', authData.user.id)
    await updateProfile(authData.user.id, email, fullName)
  }
}

async function updateProfile(id: string, email: string, fullName: string) {
  // 2. Upsert into public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id,
      email,
      full_name: fullName,
      role: 'admin'
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('Error updating profile:', profileError.message)
    process.exit(1)
  }

  console.log('Admin profile updated successfully with role: admin')
}

createAdmin()
