import Image from 'next/image'
import React from 'react'

const Avathar = ({src}:{src?:string}) => {
    if(src){
        
        return (
          <Image
              src={src}
              alt='Avathar'
              className='rounded-full'
              height={40}
              width={40}
          />
        )
    }
}

export default Avathar
