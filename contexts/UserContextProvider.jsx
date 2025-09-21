"use client";
import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const { isLoaded, user: clerkuser } = useUser(); // wait until Clerk is loaded
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // if the clerkUser has not loaded yet, do not make api call for fetching user data, becuase it will reutrn 401, unathorized as jwt token as hasn't been set in the browser
        if (!isLoaded) return;
        const getUser = async () => {
            try {
                const { data } = await axios.get("/api/user");
                if (data.success) setUser(data.user);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, [isLoaded]);

    return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);

export default UserContextProvider;
