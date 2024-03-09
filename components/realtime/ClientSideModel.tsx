'use client'

import { type Database } from '@/types/supabase'
import { type imageRow, type modelRow, type sampleRow } from '@/types/utils'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export const revalidate = 0

interface ClientSideModelProps {
  serverModel: modelRow
  serverImages: imageRow[]
  samples: sampleRow[]
}

export default function ClientSideModel({
  serverModel,
  serverImages,
  samples,
}: ClientSideModelProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [model, setModel] = useState<modelRow>(serverModel)

  useEffect(() => {
    const channel = supabase
      .channel('realtime-model')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'models' },
        (payload: { new: modelRow }) => {
          setModel(payload.new)
        }
      )
      .subscribe()

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      supabase.removeChannel(channel)
    }
  }, [supabase, model, setModel])

  return (
    <div id="train-model-container" className="w-full h-full">
      <div className="flex flex-col w-full mt-4 gap-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
          {samples && (
            <div className="flex w-full lg:w-1/2 flex-col gap-2">
              <h2 className="text-xl">Training Data</h2>
              <div className="flex flex-row gap-4 flex-wrap">
                {samples.map((sample, index) => (
                  <img
                    key={index}
                    src={sample.uri}
                    className="rounded-md w-60 h-60 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col w-full lg:w-1/2 rounded-md">
            {model.status === 'finished' && (
              <div className="flex flex-1 flex-col gap-2">
                <h1 className="text-xl">Results</h1>
                <div className="flex flex-row flex-wrap gap-4">
                  {serverImages?.map((image) => (
                    <div key={image.id}>
                      <img
                        src={image.uri}
                        className="rounded-md w-60 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
