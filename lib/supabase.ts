import { type SupabaseClient, type User } from '@supabase/supabase-js'

const createNewFloorPlan = async (
  supabase: SupabaseClient,
  user: User,
  floorPlan: Omit<IFloorPlan, 'userId'>
): Promise<void> => {
  try {
    const { data, error } = await supabase.from('floorplan').insert([
      {
        ...floorPlan,
        userid: user.id,
      },
    ])
    if (error) {
      console.error('Error inserting new floor plan:', error)
      throw error
    }

    console.log('Inserted floor plan:', data)
  } catch (err) {
    console.error('Supabase operation failed:', err)
  }
}

const updateFloorPlan = async (
  supabase: SupabaseClient,
  floorPlan: IFloorPlan
) => {
  // console.log('floorPlan is', floorPlan)
  await supabase
    .from('floorplan')
    .update(floorPlan)
    .eq('floorplanId', floorPlan.floorplanId)
}

const userHasFloorPlan = async (supabase: SupabaseClient, user: User) => {
  const { data } = await supabase
    .from('floorplan')
    .select('*')
    .eq('userid', user?.id)

  return data && data.length > 0
}

const getFloorPlans = async (supabase: SupabaseClient, user: User) => {
  const { data } = await supabase
    .from('floorplan')
    .select('*')
    .eq('userid', user.id)
    .order('created_at', { ascending: false })

  return data && data.length > 0 ? data : null
}

const getFloorPlan = async (supabase: SupabaseClient, floorplanId: string) => {
  const { data } = await supabase
    .from('floorplan')
    .select('*')
    .eq('floorplanId', floorplanId)
    .single()

  return data
}

const createUser = async (supabase: SupabaseClient, user: User) => {
  try {
    const { data, error } = await supabase.from('Users').insert([
      {
        id: user.id,
        email: user.email,
      },
    ])
  } catch (err) {
    console.error('Error creating user:', err)
  }
}

export {
  updateFloorPlan,
  createUser,
  createNewFloorPlan,
  userHasFloorPlan,
  getFloorPlans,
  getFloorPlan,
}
