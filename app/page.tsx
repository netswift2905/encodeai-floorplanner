import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import chair from '../public/chair1.jpeg'
import bed from '../public/bed1.jpeg'
import shelf from '../public/shelf1.jpeg'
import { Button } from '@/components/ui/button'
import { createNewFloorPlan, createUser } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Index() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // console.log(data)

  const userExists = async (user) => {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', user.email)

    // console.log(data)
    return (data?.length ?? 0) > 0
  }

  if (user) {
    if (!(await userExists(user))) {
      await createUser(supabase, user)
      await createNewFloorPlan(supabase, user, {
        structure: {
          walls: [],
          products: [],
        },
        name: 'First floor plan',
      })
      console.log('creating')
      return redirect('/build')
    }
  }
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col lg:flex-row items-center gap-8 p-8 max-w-6xl w-full">
        <div className="flex flex-col space-y-4 lg:w-1/2 w-full">
          <h1 className="text-5xl font-bold">
            Spark joy in your floorplan.
          </h1>
          <p className="text-gray-600 text-lg">
            Kondo helps you build your dream floorplan in seconds.
          </p>
          <p className="text-gray-600 text-lg">
          Unlock new ways to view your room. Simply upload your floorplan to discover insightful new ways to arrange your furniture.
          </p>
          <div className="flex flex-col space-y-2">
            <Link className="w-full lg:w-1/2" href="/build">
              <Button size={'lg'}>Get Inspired</Button>
            </Link>
            <p className="text-sm text-gray-500 italic">
              Trusted by 20,000+ interior designers worldwide.
            </p>
          </div>
          <div className="mt-4 text-gray-500">
            <span>Already a member? </span>
            <Link className="text-blue-600 hover:underline" href="/login">
              Sign In
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full mt-8 gap-4 flex justify-between">
          <div className="w-1/2 flex items-center justify-center">
            <img
              src={shelf.src}
              alt="Image 1"
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
          <div className="w-1/2 flex flex-col">
            <img
              src={chair.src}
              alt="Image 2"
              className="rounded-lg object-cover w-full h-full mb-4"
            />
            <img
              src={bed.src}
              alt="Image 3"
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
