import { type SupabaseClient, type User } from '@supabase/supabase-js'
import { url } from 'inspector'
import { Currency } from 'lucide-react'

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

const createObject = async (
  supabase: SupabaseClient,
  user: User,
  object: any
) => {
  try {
    const { data, error } = await supabase.from('object').insert([
      {
        user_id: user.id,
        url: object.url,
        object: object.object,
        colour: object.colour,
        price: object.price,
        currency: object.currency,
        width: object.width,
        depth: object.depth,
        additional_details: object.additional_details,
      },
    ])
    console.log('Inserted object:', data)
  } catch (error) {
    console.error('Error creating object:', error)
  }
}

const getObjects = async (supabase: SupabaseClient, user: User) => {
  const { data } = await supabase
    .from('object')
    .select('*')
    .eq('user_id', user.id)

  return data
}

export {
  updateFloorPlan,
  createUser,
  createNewFloorPlan,
  userHasFloorPlan,
  getFloorPlans,
  getFloorPlan,
  createObject,
  getObjects,
}
