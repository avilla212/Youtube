"use client";

import Image from 'next/image';
import SignIn from './sign-in'
import Link from 'next/link';

import styles from './navbar.module.css';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { onAuthStateChangedHelper } from '../utilities/firebase/firebase';
import { unsubscribe } from 'diagnostics_channel';

export default function navbar(){
    // use state hook is a way to manage state in function components
    // init user state to null since we dont know if the user is signed in or not initally
    // user maintains state and setUser updates the state
    const [user, setUser] = useState<User | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
          setUser(user);
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
      }, [] /* No dependencies, never rerun */);
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
            {/* 
                Upload button will only be visible if the user is signed in
            */}
            {/* Take the prop name user and pass in the object that we have locally */}
            <SignIn user={user}/>
        </nav>
    )
}