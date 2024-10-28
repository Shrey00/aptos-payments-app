import { ImageCopy } from '@carbon/icons-react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
}

export function WelcomeHero(props: Props) {
    return (
        <div className={twMerge("px-[2rem] h-[100vh] bg-teal-950 flex justify-center items-center",props.className)}>
            <Image
                className='sm:h-[65px] sm:w-[280px] w-[145px] h-[35px]'
                src="/Aptos_Primary_WHT.svg"
                alt="Welcome to Aptos Payments App"
                width={280}
                height={65}
                
            />
        </div>
        
    );
}
