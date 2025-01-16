"use client";

import { signInWithGoogle, signOut } from "../utilities/firebase/firebase";
import styles from './signIn.module.css';
import { User } from 'firebase/auth';
import { Fragment } from 'react';

interface SignInProps {
    user: User | null;
}

export default function SignIn({ user }: SignInProps){
    return (
        <Fragment>
            {/* Conditionally render  */}
            {
                user ? (
                    // If the user is signed in, show the sign out button
                    <button className={styles.signin} onClick={(signOut)}> 
                        Sign Out
                    </button>
                ) : (
                    // If the user is not signed in, show the sign in button
                    <button className={styles.signin} onClick={(signInWithGoogle)}>
                        Sign In
                    </button>
                )
            }
        </Fragment>
    )
}