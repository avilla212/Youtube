import Image from 'next/image';
import Link from 'next/link';
import styles from './navbar.module.css';

export default function navbar(){
    return (
        <nav className={styles.nav}>
            
            {/* href="/" will take us to the root dir  */}
            <Link href="/" >
                <span className={styles.logoContainer}>
                    <Image 
                    width={90}
                    height={20}
                    // / will by default look in the public folder
                    src="/youtube-logo.svg" 
                    alt="Youtube logo"/>
                </span>
            </Link>
        </nav>
    )
}