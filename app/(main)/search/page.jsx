"use client";

import { Suspense } from "react";
import Search from "./components/Search";

const SearchPage = () => {
    return <Suspense>{<Search />}</Suspense>;
};

export default SearchPage;
